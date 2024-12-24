import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useWebRTC = (roomId: string, localStream: MediaStream | null, addParticipant: (id: string, stream: MediaStream) => void) => {
  const peerConnections = useRef(new Map<string, RTCPeerConnection>());

  useEffect(() => {
    if (!localStream) return;

    const handleICECandidate = async (peerId: string, event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        await supabase.channel(`room:${roomId}`).send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { peerId, candidate: event.candidate }
        });
      }
    };

    const handleTrack = (peerId: string, event: RTCTrackEvent) => {
      console.log('Received remote track from:', peerId);
      if (event.streams?.[0]) {
        addParticipant(peerId, event.streams[0]);
      }
    };

    const createPeerConnection = (peerId: string) => {
      console.log('Creating new peer connection for:', peerId);
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      peerConnection.onicecandidate = (event) => handleICECandidate(peerId, event);
      peerConnection.ontrack = (event) => handleTrack(peerId, event);

      // Add local tracks to the peer connection
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnections.current.set(peerId, peerConnection);
      return peerConnection;
    };

    const channel = supabase.channel(`room:${roomId}`)
      .on('broadcast', { event: 'peer-join' }, async ({ payload }) => {
        console.log('New peer joining:', payload);
        const { peerId } = payload;
        
        const { data: { user } } = await supabase.auth.getUser();
        if (peerId === user?.id) return;

        const peerConnection = createPeerConnection(peerId);
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        channel.send({
          type: 'broadcast',
          event: 'offer',
          payload: { peerId, offer }
        });
      })
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        console.log('Received offer:', payload);
        const { peerId, offer } = payload;
        
        let peerConnection = peerConnections.current.get(peerId);
        if (!peerConnection) {
          peerConnection = createPeerConnection(peerId);
        }

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        channel.send({
          type: 'broadcast',
          event: 'answer',
          payload: { peerId, answer }
        });
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        console.log('Received answer:', payload);
        const { peerId, answer } = payload;
        const peerConnection = peerConnections.current.get(peerId);
        if (peerConnection) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
        console.log('Received ICE candidate:', payload);
        const { peerId, candidate } = payload;
        const peerConnection = peerConnections.current.get(peerId);
        if (peerConnection) {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
      peerConnections.current.forEach(connection => {
        connection.close();
      });
      peerConnections.current.clear();
    };
  }, [roomId, localStream, addParticipant]);

  return peerConnections.current;
};