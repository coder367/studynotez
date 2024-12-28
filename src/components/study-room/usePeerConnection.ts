import { useCallback } from 'react';
import { getRTCConfiguration } from './useWebRTCConfig';

export const usePeerConnection = (
  localStream: MediaStream | null,
  addParticipant: (id: string, stream: MediaStream) => void,
  removeParticipant: (id: string) => void
) => {
  const createPeerConnection = useCallback((peerId: string) => {
    console.log('Creating new peer connection for:', peerId);
    
    const peerConnection = new RTCPeerConnection(getRTCConfiguration());

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

    let remoteStream: MediaStream | null = null;

    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      
      if (!remoteStream) {
        remoteStream = new MediaStream();
        console.log('Created new remote stream');
      }

      // Add the track to our remote stream
      remoteStream.addTrack(event.track);
      console.log('Added track to remote stream:', {
        streamId: remoteStream.id,
        trackKind: event.track.kind
      });

      // Only add the participant once we have both audio and video tracks (if video is enabled)
      const hasAudioTrack = remoteStream.getAudioTracks().length > 0;
      const hasVideoTrack = remoteStream.getVideoTracks().length > 0;
      
      if (hasAudioTrack && (hasVideoTrack || event.track.kind === 'audio')) {
        console.log('Adding participant with complete stream');
        addParticipant(peerId, remoteStream);
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', {
          type: event.candidate.type,
          protocol: event.candidate.protocol,
          address: event.candidate.address,
          port: event.candidate.port
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed:', {
        peerId,
        state: peerConnection.connectionState,
        iceState: peerConnection.iceConnectionState,
        signalingState: peerConnection.signalingState
      });

      if (peerConnection.connectionState === 'failed') {
        console.log('Connection failed, attempting to restart ICE');
        peerConnection.restartIce();
      } else if (peerConnection.connectionState === 'closed') {
        console.log('Connection closed, removing participant:', peerId);
        removeParticipant(peerId);
        if (remoteStream) {
          remoteStream.getTracks().forEach(track => track.stop());
          remoteStream = null;
        }
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', {
        peerId,
        state: peerConnection.iceConnectionState
      });
      
      if (peerConnection.iceConnectionState === 'failed') {
        console.log('ICE connection failed, attempting to restart');
        peerConnection.restartIce();
      }
    };

    return peerConnection;
  }, [localStream, addParticipant, removeParticipant]);

  return { createPeerConnection };
};