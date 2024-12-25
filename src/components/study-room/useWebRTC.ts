import { useEffect, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useWebRTC = (
  roomId: string, 
  localStream: MediaStream | null, 
  addParticipant: (id: string, stream: MediaStream) => void,
  removeParticipant: (id: string) => void
) => {
  const peerConnections = useRef(new Map<string, RTCPeerConnection>());

  const createPeerConnection = useCallback((peerId: string) => {
    console.log('Creating new peer connection for:', peerId);
    
    if (peerConnections.current.has(peerId)) {
      console.log('Peer connection already exists for:', peerId);
      return peerConnections.current.get(peerId)!;
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        }
      ],
      iceCandidatePoolSize: 10
    });

    // Add local tracks to the peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log('Adding track to peer connection:', track.kind);
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      if (event.streams?.[0]) {
        console.log('Adding participant with stream');
        addParticipant(peerId, event.streams[0]);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to:', peerId);
        await supabase.channel(`room:${roomId}`).send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { peerId, candidate: event.candidate }
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed' || 
          peerConnection.connectionState === 'closed') {
        console.log('Removing participant due to connection state:', peerId);
        removeParticipant(peerId);
        peerConnections.current.delete(peerId);
      }
    };

    // Log ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
    };

    peerConnections.current.set(peerId, peerConnection);
    return peerConnection;
  }, [roomId, localStream, addParticipant, removeParticipant]);

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
        
        try {
          const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          await peerConnection.setLocalDescription(offer);
          
          await channel.send({
            type: 'broadcast',
            event: 'offer',
            payload: { peerId, offer }
          });
        } catch (error) {
          console.error('Error creating offer:', error);
        }
      })
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        const { peerId, offer } = payload;
        console.log('Received offer from:', peerId);
        
        try {
          const peerConnection = createPeerConnection(peerId);
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          
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
          } catch (error) {
            console.error('Error setting remote description:', error);
          }
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
        const { peerId, candidate } = payload;
        console.log('Received ICE candidate from:', peerId);
        
        const peerConnection = peerConnections.current.get(peerId);
        if (peerConnection) {
          try {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }
      });

    // Announce presence to other peers
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
    };
  }, [roomId, localStream, createPeerConnection]);

  return peerConnections.current;
};