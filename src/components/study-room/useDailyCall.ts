import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DailyIframe from '@daily-co/daily-js';

export const useDailyCall = () => {
  const [isDailyEnabled, setIsDailyEnabled] = useState(false);
  const [dailyCall, setDailyCall] = useState<any>(null);
  const { toast } = useToast();

  const handleDailyStart = useCallback(async (roomId: string) => {
    try {
      const response = await supabase.functions.invoke('create-daily-room', {
        body: { roomName: `${roomId}-${Date.now()}` },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { url } = response.data;
      console.log('Creating Daily call frame with URL:', url);
      
      const callFrame = DailyIframe.createFrame({
        url,
        showLeaveButton: true,
        iframeStyle: {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          border: 'none',
          zIndex: '999',
        },
      });

      callFrame.join();
      setDailyCall(callFrame);
      setIsDailyEnabled(true);

      toast({
        title: "Success",
        description: "Daily.co video call started successfully",
      });
    } catch (error: any) {
      console.error("Error starting Daily call:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start Daily.co video call. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const cleanup = useCallback(() => {
    if (dailyCall) {
      dailyCall.destroy();
      setDailyCall(null);
      setIsDailyEnabled(false);
    }
  }, [dailyCall]);

  return {
    isDailyEnabled,
    dailyCall,
    handleDailyStart,
    cleanup,
  };
};