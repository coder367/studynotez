import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { VideoCallProps } from "@/types/video-call";
import { ParticipantVideo } from "./ParticipantVideo";
import { Controls } from "./Controls";
import { useMediaStream } from "./useMediaStream";
import { useRoomPresence } from "./useRoomPresence";

const VideoCall = ({ roomId, isVoiceOnly = false }: VideoCallProps) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  
  const { 
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    audioLevel,
    toggleAudio,
    toggleVideo
  } = useMediaStream(isVoiceOnly);
  
  const { participants } = useRoomPresence(roomId, userName);

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
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("room_participants")
        .delete()
        .eq("room_id", roomId)
        .eq("user_id", user.id);
    }

    navigate("/dashboard/study-room");
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