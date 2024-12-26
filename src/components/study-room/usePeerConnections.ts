import { useRef, useCallback } from 'react';
import { getRTCConfiguration } from './useWebRTCConfig';

export const usePeerConnections = (
  localStream: MediaStream | null,
  addParticipant: (id: string, stream: MediaStream) => void,
  removeParticipant: (id: string) => void
) => {
  const peerConnections = useRef(new Map<string, RTCPeerConnection>());

  const createPeerConnection = useCallback((peerId: string) => {
    console.log('Creating new peer connection for:', peerId);
    
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
        console.log('Adding participant with stream');
        addParticipant(peerId, event.streams[0]);
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate.type);
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed:', peerConnection.connectionState);
      if (['failed', 'closed', 'disconnected'].includes(peerConnection.connectionState)) {
        console.log('Removing participant due to connection state:', peerId);
        removeParticipant(peerId);
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
  }, [localStream, addParticipant, removeParticipant]);

  return {
    peerConnections,
    createPeerConnection
  };
};