import { useEffect, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { usePeerConnection } from './usePeerConnection';

export const useWebRTC = (
  roomId: string, 
  localStream: MediaStream | null, 
  addParticipant: (id: string, stream: MediaStream) => void,
  removeParticipant: (id: string) => void
) => {
  const peerConnections = useRef(new Map<string, RTCPeerConnection>());
  const iceCandidatesQueue = useRef(new Map<string, RTCIceCandidate[]>());
  const { createPeerConnection } = usePeerConnection(localStream, addParticipant, removeParticipant);

  const addIceCandidate = async (peerId: string, candidate: RTCIceCandidate) => {
    console.log('Adding ICE candidate for peer:', peerId);
    const peerConnection = peerConnections.current.get(peerId);
    
    if (!peerConnection?.remoteDescription) {
      console.log('Queueing ICE candidate - no remote description yet');
      const queue = iceCandidatesQueue.current.get(peerId) || [];
      queue.push(candidate);
      iceCandidatesQueue.current.set(peerId, queue);
      return;
    }

    try {
      await peerConnection.addIceCandidate(candidate);
      console.log('ICE candidate added successfully');
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  const processQueuedCandidates = async (peerId: string) => {
    const peerConnection = peerConnections.current.get(peerId);
    const queuedCandidates = iceCandidatesQueue.current.get(peerId) || [];
    
    if (peerConnection?.remoteDescription && queuedCandidates.length > 0) {
      console.log(`Processing ${queuedCandidates.length} queued candidates for:`, peerId);
      
      for (const candidate of queuedCandidates) {
        try {
          await peerConnection.addIceCandidate(candidate);
          console.log('Queued ICE candidate added successfully');
        } catch (error) {
          console.error('Error adding queued ICE candidate:', error);
        }
      }
      
      iceCandidatesQueue.current.delete(peerId);
    }
  };

  useEffect(() => {
    if (!localStream) return;

    console.log('Setting up WebRTC for room:', roomId);
    const channel = supabase.channel(`room:${roomId}`)
      .on('broadcast', { event: 'peer-join' }, async ({ payload }) => {
        const { peerId } = payload;
        const { data: { user } } = await supabase.auth.getUser();
        
        if (peerId === user?.id) return;
        
        console.log('New peer joining:', peerId);
        const peerConnection = createPeerConnection(peerId);
        peerConnections.current.set(peerId, peerConnection);

        try {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          
          await channel.send({
            type: 'broadcast',
            event: 'offer',
            payload: { peerId, offer }
          });

          peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
              console.log('Sending ICE candidate to:', peerId);
              await channel.send({
                type: 'broadcast',
                event: 'ice-candidate',
                payload: { peerId, candidate: event.candidate }
              });
            }
          };
        } catch (error) {
          console.error('Error creating offer:', error);
        }
      })
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        const { peerId, offer } = payload;
        console.log('Received offer from:', peerId);
        
        try {
          const peerConnection = createPeerConnection(peerId);
          peerConnections.current.set(peerId, peerConnection);

          peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
              console.log('Sending ICE candidate to:', peerId);
              await channel.send({
                type: 'broadcast',
                event: 'ice-candidate',
                payload: { peerId, candidate: event.candidate }
              });
            }
          };

          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          await processQueuedCandidates(peerId);
          
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          await channel.send({
            type: 'broadcast',
            event: 'answer',
            payload: { peerId, answer }
          });
        } catch (error) {
          console.error('Error handling offer:', error);
        }
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        const { peerId, answer } = payload;
        console.log('Received answer from:', peerId);
        
        const peerConnection = peerConnections.current.get(peerId);
        if (peerConnection) {
          try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            await processQueuedCandidates(peerId);
          } catch (error) {
            console.error('Error setting remote description:', error);
          }
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        const { peerId, candidate } = payload;
        console.log('Received ICE candidate from:', peerId);
        await addIceCandidate(peerId, new RTCIceCandidate(candidate));
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
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
      iceCandidatesQueue.current.clear();
    };
  }, [roomId, localStream, createPeerConnection]);

  return peerConnections.current;
};