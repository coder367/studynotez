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
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const VideoCall = ({ roomId, isVoiceOnly = false }: VideoCallProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>("");
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  
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

  const { data: zoomConfig } = useQuery({
    queryKey: ["zoomMeeting", roomId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('zoom_meetings')
          .select('meeting_url, password')
          .eq('room_id', roomId)
          .maybeSingle();

        if (error) {
          console.error("Database error:", error);
          throw new Error("Failed to fetch Zoom meeting details");
        }

        return data;
      } catch (error) {
        console.error("Error fetching zoom meeting:", error);
        return null;
      }
    },
  });

  const handleZoomStart = () => {
    if (zoomConfig?.meeting_url) {
      window.open(zoomConfig.meeting_url, '_blank');
      setIsZoomEnabled(true);
    } else {
      toast({
        title: "No Zoom Meeting Found",
        description: "No Zoom meeting has been set up for this room yet.",
        variant: "destructive",
      });
    }
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
    };
  }, [isVoiceOnly, initializeMedia, stopAllTracks]);

  const handleLeaveCall = async () => {
    try {
      stopAllTracks();
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
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={handleZoomStart}
          disabled={isZoomEnabled}
        >
          {isZoomEnabled ? "Zoom Meeting Active" : "Start Zoom Meeting"}
        </Button>
      </div>

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