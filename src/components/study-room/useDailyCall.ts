import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DailyIframe, { DailyCall } from '@daily-co/daily-js';

export const useDailyCall = (roomId: string) => {
  const [dailyRoom, setDailyRoom] = useState<DailyCall | null>(null);
  const [isDailyEnabled, setIsDailyEnabled] = useState(false);
  const { toast } = useToast();

  const handleDailyStart = async () => {
    try {
      // Create Daily.co room
      const { data, error } = await supabase.functions.invoke('create-daily-room', {
        body: { roomName: `study-${roomId}` }
      });

      if (error) throw error;

      // Initialize Daily.co iframe
      const dailyFrame = DailyIframe.createFrame({
        showLeaveButton: true,
        showFullscreenButton: true,
        iframeStyle: {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          border: 'none',
          zIndex: '999'
        }
      });

      await dailyFrame.join({ url: data.url });
      
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

  const cleanup = () => {
    if (dailyRoom) {
      dailyRoom.destroy();
    }
  };

  return {
    dailyRoom,
    isDailyEnabled,
    handleDailyStart,
    cleanup
  };
};