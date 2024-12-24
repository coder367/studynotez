import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { VideoCallProps } from "@/types/video-call";
import { ParticipantVideo } from "./ParticipantVideo";
import { Controls } from "./Controls";
import { useMediaStream } from "./useMediaStream";
import { useRoomPresence } from "./useRoomPresence";
import { useToast } from "@/hooks/use-toast";

const VideoCall = ({ roomId, isVoiceOnly = false }: VideoCallProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>("");
  const [peerConnections] = useState(new Map());
  
  const { 
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    audioLevel,
    toggleAudio,
    toggleVideo,
    initializeMedia,
    stopAllTracks
  } = useMediaStream(isVoiceOnly);
  
  const { participants, addParticipant, removeParticipant } = useRoomPresence(roomId, userName);

  useEffect(() => {
    const setupWebRTC = async () => {
      if (!localStream) return;

      const channel = supabase.channel(`room:${roomId}`);

      // Handle new peer joining
      channel.on('broadcast', { event: 'peer-join' }, async ({ payload }) => {
        console.log('New peer joining:', payload);
        const { peerId } = payload;
        
        if (peerId === (await supabase.auth.getUser()).data.user?.id) return;

        const peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // Add local tracks to peer connection
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream);
        });

        // Create and send offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        channel.send({
          type: 'broadcast',
          event: 'offer',
          payload: { peerId, offer }
        });

        peerConnections.set(peerId, peerConnection);
        
        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            channel.send({
              type: 'broadcast',
              event: 'ice-candidate',
              payload: { peerId, candidate: event.candidate }
            });
          }
        };

        // Handle remote stream
        peerConnection.ontrack = (event) => {
          console.log('Received remote track:', event);
          addParticipant(peerId, event.streams[0]);
        };
      });

      // Handle offers
      channel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
        console.log('Received offer:', payload);
        const { peerId, offer } = payload;
        
        const peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnections.set(peerId, peerConnection);

        // Add local tracks
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream);
        });

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            channel.send({
              type: 'broadcast',
              event: 'ice-candidate',
              payload: { peerId, candidate: event.candidate }
            });
          }
        };

        // Handle remote stream
        peerConnection.ontrack = (event) => {
          console.log('Received remote track from offer:', event);
          addParticipant(peerId, event.streams[0]);
        };

        // Set remote description and create answer
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        channel.send({
          type: 'broadcast',
          event: 'answer',
          payload: { peerId, answer }
        });
      });

      // Handle answers
      channel.on('broadcast', { event: 'answer' }, async ({ payload }) => {
        console.log('Received answer:', payload);
        const { peerId, answer } = payload;
        const peerConnection = peerConnections.get(peerId);
        if (peerConnection) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      // Handle ICE candidates
      channel.on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
        console.log('Received ICE candidate:', payload);
        const { peerId, candidate } = payload;
        const peerConnection = peerConnections.get(peerId);
        if (peerConnection) {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      // Subscribe to the channel
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            channel.send({
              type: 'broadcast',
              event: 'peer-join',
              payload: { peerId: user.id }
            });
          }
        }
      });

      return () => {
        channel.unsubscribe();
      };
    };

    if (localStream) {
      setupWebRTC();
    }
  }, [localStream, roomId, peerConnections, addParticipant]);

  useEffect(() => {
    initializeMedia();
    return () => {
      stopAllTracks();
      peerConnections.forEach(connection => {
        connection.close();
      });
      peerConnections.clear();
    };
  }, [isVoiceOnly, initializeMedia, stopAllTracks, peerConnections]);

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profile) {
          setUserName(profile.full_name || "Anonymous");
        }
      }
    };

    fetchUserName();
  }, []);

  const handleLeaveCall = async () => {
    try {
      stopAllTracks();
      peerConnections.forEach(connection => {
        connection.close();
      });
      peerConnections.clear();

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("room_participants")
          .delete()
          .eq("room_id", roomId)
          .eq("user_id", user.id);
      }

      navigate("/dashboard/study-room");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to leave the room properly",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ParticipantVideo
          participant={{ id: "local", stream: localStream }}
          isLocal={true}
          userName={userName}
          audioLevel={audioLevel}
          isAudioEnabled={isAudioEnabled && !isVoiceOnly}
        />

        {Array.from(participants.values()).map((participant) => (
          <ParticipantVideo
            key={participant.id}
            participant={participant}
            userName={participant.username}
            audioLevel={0}
            isAudioEnabled={!isVoiceOnly}
          />
        ))}
      </div>

      <Controls
        isVoiceOnly={isVoiceOnly}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onLeaveCall={handleLeaveCall}
      />
    </div>
  );
};

export default VideoCall;