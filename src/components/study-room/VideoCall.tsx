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

const VideoCall = ({ roomId, isVoiceOnly = false }: VideoCallProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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
  const webrtc = useWebRTC(roomId, localStream, addParticipant, removeParticipant);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to join the room",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }
        setIsAuthenticated(true);

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserName(profile.full_name || "Anonymous");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        toast({
          title: "Error",
          description: "Failed to verify authentication",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    if (!isAuthenticated) return;

    console.log("Initializing media stream");
    initializeMedia();
    
    return () => {
      console.log("Cleaning up media stream");
      stopAllTracks();
    };
  }, [isAuthenticated, initializeMedia, stopAllTracks]);

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

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col gap-4">
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