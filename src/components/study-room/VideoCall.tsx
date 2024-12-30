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
import DailyIframe from '@daily-co/daily-js';

const VideoCall = ({ roomId, isVoiceOnly = false }: VideoCallProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>("");
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [dailyRoom, setDailyRoom] = useState<any>(null);
  const [isDailyEnabled, setIsDailyEnabled] = useState(false);
  
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
        throw error;
      }
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

  const handleDailyStart = async () => {
    try {
      // Create Daily.co room
      const { data, error } = await supabase.functions.invoke('create-daily-room', {
        body: { roomName: `study-${roomId}` }
      });

      if (error) throw error;

      // Initialize Daily.co iframe
      const dailyFrame = await DailyIframe.createFrame({
        iframeStyle: {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          border: 'none',
          zIndex: 999
        },
        showLeaveButton: true,
        showFullscreenButton: true,
      });

      dailyFrame.join({ url: data.url });
      
      setDailyRoom(dailyFrame);
      setIsDailyEnabled(true);

      // Handle leave event
      dailyFrame.on('left-meeting', () => {
        dailyFrame.destroy();
        setDailyRoom(null);
        setIsDailyEnabled(false);
      });

    } catch (error) {
      console.error("Error starting Daily.co meeting:", error);
      toast({
        title: "Error",
        description: "Failed to start video call. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleZoomStart = () => {
    if (!zoomConfig) {
      toast({
        title: "No Zoom Meeting Found",
        description: "No Zoom meeting has been set up for this room yet. Please contact the room administrator.",
        variant: "destructive",
      });
      return;
    }

    if (!zoomConfig.meeting_url) {
      toast({
        title: "Invalid Meeting URL",
        description: "The Zoom meeting URL is invalid. Please contact the room administrator.",
        variant: "destructive",
      });
      return;
    }

    try {
      window.open(zoomConfig.meeting_url, '_blank');
      setIsZoomEnabled(true);
      toast({
        title: "Zoom Meeting Started",
        description: "The Zoom meeting has been opened in a new tab.",
      });
    } catch (error) {
      console.error("Error opening Zoom meeting:", error);
      toast({
        title: "Error",
        description: "Failed to open Zoom meeting. Please try again.",
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
      if (dailyRoom) {
        dailyRoom.destroy();
      }
    };
  }, [isVoiceOnly, initializeMedia, stopAllTracks]);

  const handleLeaveCall = async () => {
    try {
      stopAllTracks();
      if (dailyRoom) {
        dailyRoom.destroy();
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
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant="outline"
          onClick={handleDailyStart}
          disabled={isDailyEnabled}
        >
          {isDailyEnabled ? "Video Call Active" : "Start Video Call"}
        </Button>
        <Button
          variant="outline"
          onClick={handleZoomStart}
          disabled={isZoomEnabled || isZoomError}
        >
          {isZoomEnabled ? "Zoom Meeting Active" : "Start Zoom Meeting"}
        </Button>
      </div>

      {!isDailyEnabled && (
        <>
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
        </>
      )}
    </div>
  );
};

export default VideoCall;