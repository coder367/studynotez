import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { usePeerConnections } from './usePeerConnections';
import { useIceCandidates } from './useIceCandidates';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useWebRTC = (
  roomId: string, 
  localStream: MediaStream | null, 
  addParticipant: (id: string, stream: MediaStream) => void,
  removeParticipant: (id: string) => void
) => {
  const { peerConnections, createPeerConnection } = usePeerConnections(
    localStream,
    addParticipant,
    removeParticipant
  );
  
  const { addIceCandidate, processQueuedCandidates } = useIceCandidates();

  const handlePeerJoin = async (channel: RealtimeChannel, peerId: string) => {
    console.log('Handling peer join:', peerId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || peerId === user.id) {
      console.log('Ignoring self join event');
      return;
    }
    
    try {
      const peerConnection = createPeerConnection(peerId);
      console.log('Created peer connection for:', peerId);

      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await peerConnection.setLocalDescription(offer);
      console.log('Created and set local offer for:', peerId);
      
      await channel.send({
        type: 'broadcast',
        event: 'offer',
        payload: { peerId: user.id, offer }
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (
    channel: RealtimeChannel,
    peerId: string,
    offer: RTCSessionDescriptionInit
  ) => {
    console.log('Received offer from:', peerId);
    
    try {
      let peerConnection = peerConnections.current.get(peerId);
      if (!peerConnection) {
        peerConnection = createPeerConnection(peerId);
        console.log('Created new peer connection for offer from:', peerId);
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      await processQueuedCandidates(peerId, peerConnection);
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await channel.send({
        type: 'broadcast',
        event: 'answer',
        payload: { peerId: user.id, answer }
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (
    peerId: string,
    answer: RTCSessionDescriptionInit
  ) => {
    console.log('Received answer from:', peerId);
    
    const peerConnection = peerConnections.current.get(peerId);
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        await processQueuedCandidates(peerId, peerConnection);
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    }
  };

  useEffect(() => {
    if (!localStream) {
      console.log('No local stream available, skipping WebRTC setup');
      return;
    }

    console.log('Setting up WebRTC for room:', roomId);
    const channel = supabase.channel(`room:${roomId}`)
      .on('broadcast', { event: 'peer-join' }, async ({ payload }) => {
        console.log('Peer join broadcast received:', payload);
        await handlePeerJoin(channel, payload.peerId);
      })
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        console.log('Offer broadcast received:', payload);
        await handleOffer(channel, payload.peerId, payload.offer);
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        console.log('Answer broadcast received:', payload);
        await handleAnswer(payload.peerId, payload.answer);
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        console.log('ICE candidate broadcast received:', payload);
        const peerConnection = peerConnections.current.get(payload.peerId);
        await addIceCandidate(
          payload.peerId,
          new RTCIceCandidate(payload.candidate),
          peerConnection
        );
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Channel subscribed, announcing presence');
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await channel.send({
            type: 'broadcast',
            event: 'peer-join',
            payload: { peerId: user.id }
          });
        }
      }
    });

    return () => {
      console.log('Cleaning up WebRTC connections');
      channel.unsubscribe();
      peerConnections.current.forEach(connection => {
        connection.close();
      });
      peerConnections.current.clear();
    };
  }, [
    roomId,
    localStream,
    createPeerConnection,
    addIceCandidate,
    processQueuedCandidates
  ]);

  return peerConnections.current;
};