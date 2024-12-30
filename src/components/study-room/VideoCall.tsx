import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { VideoCallProps } from "@/types/video-call";
import { Controls } from "./Controls";
import { useMediaStream } from "./useMediaStream";
import { useRoomPresence } from "./useRoomPresence";
import { useWebRTC } from "./useWebRTC";
import { useToast } from "@/hooks/use-toast";
import { VideoGrid } from "./VideoGrid";
import { useQuery } from "@tanstack/react-query";
import { useDailyCall } from "./useDailyCall";
import { VideoCallControls } from "./VideoCallControls";

const VideoCall = ({ roomId, isVoiceOnly = false }: VideoCallProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>("");
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  
  const { 
    isDailyEnabled,
    dailyCall,
    handleDailyStart,
    cleanup: cleanupDaily
  } = useDailyCall();
  
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
  
  useWebRTC(roomId, localStream, addParticipant, removeParticipant);

  const { data: zoomConfig, isError: isZoomError } = useQuery({
    queryKey: ["zoomMeeting", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zoom_meetings')
        .select('meeting_url, password')
        .eq('room_id', roomId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    retry: 1,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to fetch Zoom meeting details. Please try again later.",
          variant: "destructive",
        });
      }
    }
  });

  const handleZoomStart = () => {
    if (!zoomConfig?.meeting_url) {
      toast({
        title: "No Zoom Meeting Found",
        description: "No Zoom meeting has been set up for this room yet.",
        variant: "destructive",
      });
      return;
    }

    window.open(zoomConfig.meeting_url, '_blank');
    setIsZoomEnabled(true);
    toast({
      title: "Zoom Meeting Started",
      description: "The Zoom meeting has been opened in a new tab.",
    });
  };

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

  useEffect(() => {
    console.log("Initializing media stream");
    initializeMedia();
    return () => {
      console.log("Cleaning up media stream");
      stopAllTracks();
      cleanupDaily();
    };
  }, [isVoiceOnly, initializeMedia, stopAllTracks, cleanupDaily]);

  const handleLeaveCall = async () => {
    try {
      stopAllTracks();
      cleanupDaily();
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
      <VideoCallControls
        isDailyEnabled={isDailyEnabled}
        isZoomEnabled={isZoomEnabled}
        isZoomError={isZoomError}
        onDailyStart={() => handleDailyStart(roomId)}
        onZoomStart={handleZoomStart}
      />

      <VideoGrid
        participants={participants}
        localStream={localStream}
        userName={userName}
        audioLevel={audioLevel}
        isAudioEnabled={isAudioEnabled}
      />

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