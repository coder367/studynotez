import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getRTCConfiguration } from './useWebRTCConfig';
import { useToast } from '@/hooks/use-toast';

export const usePeerConnections = (
  roomId: string,
  localStream: MediaStream | null,
  addParticipant: (id: string, stream: MediaStream) => void,
  removeParticipant: (id: string) => void
) => {
  const peerConnections = useRef(new Map<string, RTCPeerConnection>());
  const { toast } = useToast();
  const reconnectionAttempts = useRef(new Map<string, number>());
  const MAX_RECONNECTION_ATTEMPTS = 3;

  const createPeerConnection = useCallback((peerId: string) => {
    console.log('Creating new peer connection for:', peerId);
    
    if (peerConnections.current.has(peerId)) {
      console.log('Closing existing connection for peer:', peerId);
      const existingConnection = peerConnections.current.get(peerId);
      existingConnection?.close();
      peerConnections.current.delete(peerId);
      removeParticipant(peerId);
    }
    
    const peerConnection = new RTCPeerConnection(getRTCConfiguration());

    const handleConnectionStateChange = async () => {
      console.log(`Connection state changed for peer ${peerId}:`, peerConnection.connectionState);
      console.log('ICE gathering state:', peerConnection.iceGatheringState);
      console.log('ICE connection state:', peerConnection.iceConnectionState);
      console.log('Signaling state:', peerConnection.signalingState);
      
      if (['failed', 'closed', 'disconnected'].includes(peerConnection.connectionState)) {
        const attempts = reconnectionAttempts.current.get(peerId) || 0;
        
        if (attempts < MAX_RECONNECTION_ATTEMPTS) {
          console.log(`Attempting reconnection ${attempts + 1}/${MAX_RECONNECTION_ATTEMPTS} for peer:`, peerId);
          reconnectionAttempts.current.set(peerId, attempts + 1);
          
          // Close existing connection
          peerConnection.close();
          peerConnections.current.delete(peerId);
          removeParticipant(peerId);
          
          // Trigger a new connection attempt
          const channel = supabase.channel(`room:${roomId}`);
          await channel.send({
            type: 'broadcast',
            event: 'peer-join',
            payload: { peerId }
          });
          
          toast({
            title: "Connection Issue",
            description: "Attempting to reconnect...",
            variant: "default",
          });
        } else {
          console.log('Max reconnection attempts reached for peer:', peerId);
          removeParticipant(peerId);
          reconnectionAttempts.current.delete(peerId);
          
          toast({
            title: "Connection Failed",
            description: "Unable to establish connection with peer. Please try rejoining the room.",
            variant: "destructive",
          });
        }
      } else if (peerConnection.connectionState === 'connected') {
        reconnectionAttempts.current.delete(peerId);
        console.log('Connection established successfully with peer:', peerId);
      }
    };

    peerConnection.onconnectionstatechange = handleConnectionStateChange;

    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for peer ${peerId}:`, peerConnection.iceConnectionState);
      if (peerConnection.iceConnectionState === 'failed') {
        console.log('ICE connection failed, attempting restart...');
        peerConnection.restartIce();
      }
    };

    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', {
          type: event.candidate.type,
          protocol: event.candidate.protocol,
          address: event.candidate.address,
          port: event.candidate.port,
          priority: event.candidate.priority,
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

    peerConnections.current.set(peerId, peerConnection);
    return peerConnection;
  }, [localStream, addParticipant, removeParticipant, roomId, toast]);

  return {
    peerConnections,
    createPeerConnection
  };
};