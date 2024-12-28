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

    if (localStream) {
      console.log('Adding local tracks to peer connection');
      localStream.getTracks().forEach(track => {
        if (localStream.active) {
          console.log('Adding track to peer connection:', track.kind);
          peerConnection.addTrack(track, localStream);
        }
      });
    }

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

    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate.type);
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

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed:', peerConnection.connectionState);
      if (['failed', 'closed', 'disconnected'].includes(peerConnection.connectionState)) {
        console.log('Removing participant due to connection state:', peerId);
        removeParticipant(peerId);
        peerConnections.current.delete(peerId);
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
      if (peerConnection.iceConnectionState === 'failed') {
        console.log('Attempting to restart ICE');
        peerConnection.restartIce();
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