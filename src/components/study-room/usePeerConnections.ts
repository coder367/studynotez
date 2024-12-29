import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getRTCConfiguration } from './useWebRTCConfig';

export const usePeerConnections = (
  roomId: string,
  localStream: MediaStream | null,
  addParticipant: (id: string, stream: MediaStream) => void,
  removeParticipant: (id: string) => void
) => {
  const peerConnections = useRef(new Map<string, RTCPeerConnection>());

  const createPeerConnection = useCallback((peerId: string) => {
    console.log('Creating new peer connection for:', peerId);
    
    // Remove any existing connection for this peer
    if (peerConnections.current.has(peerId)) {
      console.log('Closing existing connection for peer:', peerId);
      const existingConnection = peerConnections.current.get(peerId);
      existingConnection?.close();
      peerConnections.current.delete(peerId);
      removeParticipant(peerId);
    }
    
    const peerConnection = new RTCPeerConnection(getRTCConfiguration());

    // Add connection state logging
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state changed for peer ${peerId}:`, peerConnection.connectionState);
      if (['failed', 'closed', 'disconnected'].includes(peerConnection.connectionState)) {
        console.log('Connection failed or closed, removing participant:', peerId);
        removeParticipant(peerId);
        peerConnections.current.delete(peerId);
      }
    };

    // Enhanced ICE connection state handling
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for peer ${peerId}:`, peerConnection.iceConnectionState);
      switch (peerConnection.iceConnectionState) {
        case 'failed':
          console.log('ICE connection failed, attempting restart...');
          peerConnection.restartIce();
          break;
        case 'disconnected':
          console.log('ICE connection disconnected, waiting for reconnection...');
          // Wait for potential recovery
          setTimeout(() => {
            if (peerConnection.iceConnectionState === 'disconnected') {
              console.log('Connection did not recover, restarting...');
              peerConnection.restartIce();
            }
          }, 5000);
          break;
      }
    };

    // Add ICE candidate handling with detailed logging
    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', {
          type: event.candidate.type,
          protocol: event.candidate.protocol,
          address: event.candidate.address,
        });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const channel = supabase.channel(`room:${roomId}`);
        await channel.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            peerId: user.id,
            candidate: event.candidate
          }
        });
      }
    };

    // Add track handling
    if (localStream) {
      console.log('Adding local tracks to peer connection');
      localStream.getTracks().forEach(track => {
        if (localStream.active) {
          console.log('Adding track to peer connection:', track.kind);
          peerConnection.addTrack(track, localStream);
        }
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      if (event.streams?.[0]) {
        console.log('Adding participant with stream:', {
          peerId,
          streamId: event.streams[0].id,
          tracks: event.streams[0].getTracks().map(t => t.kind)
        });
        addParticipant(peerId, event.streams[0]);
      }
    };

    // Add negotiation needed handler
    peerConnection.onnegotiationneeded = async () => {
      console.log('Negotiation needed for peer:', peerId);
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const channel = supabase.channel(`room:${roomId}`);
        await channel.send({
          type: 'broadcast',
          event: 'offer',
          payload: { peerId: user.id, offer }
        });
      } catch (error) {
        console.error('Error during negotiation:', error);
      }
    };

    peerConnections.current.set(peerId, peerConnection);
    return peerConnection;
  }, [localStream, addParticipant, removeParticipant, roomId]);

  return {
    peerConnections,
    createPeerConnection
  };
};