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
    
    // Clean up existing connection if any
    if (peerConnections.current.has(peerId)) {
      console.log('Closing existing connection for peer:', peerId);
      const existingConnection = peerConnections.current.get(peerId);
      if (existingConnection) {
        existingConnection.getSenders().forEach(sender => {
          existingConnection.removeTrack(sender);
        });
        existingConnection.close();
      }
      peerConnections.current.delete(peerId);
      removeParticipant(peerId);
    }
    
    const peerConnection = new RTCPeerConnection({
      ...getRTCConfiguration(),
    });

    // Add all tracks from local stream
    if (localStream) {
      console.log('Adding local tracks to peer connection');
      localStream.getTracks().forEach(track => {
        if (localStream.active) {
          console.log('Adding track to peer connection:', {
            kind: track.kind,
            enabled: track.enabled,
            id: track.id
          });
          peerConnection.addTrack(track, localStream);
        }
      });
    }

    // Handle remote tracks with proper stream management
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', {
        kind: event.track.kind,
        enabled: event.track.enabled,
        id: event.track.id
      });
      
      if (event.streams?.[0]) {
        const stream = event.streams[0];
        console.log('Adding participant with stream:', {
          peerId,
          streamId: stream.id,
          tracks: stream.getTracks().map(t => ({
            kind: t.kind,
            enabled: t.enabled,
            id: t.id
          }))
        });

        // Monitor track endings
        event.track.onended = () => {
          console.log(`Remote track ended: ${event.track.id}`);
        };

        // Monitor track mute/unmute
        event.track.onmute = () => {
          console.log(`Remote track muted: ${event.track.id}`);
        };

        event.track.onunmute = () => {
          console.log(`Remote track unmuted: ${event.track.id}`);
        };

        addParticipant(peerId, stream);
      }
    };

    // Enhanced ICE candidate handling
    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', {
          type: event.candidate.type,
          protocol: event.candidate.protocol,
          address: event.candidate.address,
          port: event.candidate.port
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

    // Improved connection state monitoring
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed:', {
        peerId,
        state: peerConnection.connectionState,
        iceState: peerConnection.iceConnectionState,
        signalingState: peerConnection.signalingState
      });
      
      if (['failed', 'closed', 'disconnected'].includes(peerConnection.connectionState)) {
        console.log('Removing participant due to connection state:', peerId);
        removeParticipant(peerId);
        peerConnections.current.delete(peerId);
      }
    };

    // Enhanced ICE connection state handling
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', {
        peerId,
        state: peerConnection.iceConnectionState,
        connectionState: peerConnection.connectionState
      });
      
      if (peerConnection.iceConnectionState === 'failed') {
        console.log('Attempting to restart ICE');
        peerConnection.restartIce();
      }
    };

    // Monitor negotiation needed events
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
          payload: {
            peerId: user.id,
            offer: peerConnection.localDescription
          }
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