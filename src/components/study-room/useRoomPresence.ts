import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Participant } from "@/types/video-call";
import { RealtimeChannel } from "@supabase/supabase-js";

export const useRoomPresence = (roomId: string, userName: string) => {
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const mounted = useRef(false);

  const addParticipant = useCallback((userId: string, stream?: MediaStream) => {
    console.log("Adding participant:", userId);
    setParticipants(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(userId);
      
      newMap.set(userId, {
        id: userId,
        stream: stream || existing?.stream,
        username: userName,
        isAudioEnabled: true,
        isVideoEnabled: true
      });
      
      console.log("Updated participants:", Array.from(newMap.entries()));
      return newMap;
    });
  }, [userName]);

  const removeParticipant = useCallback((userId: string) => {
    console.log("Removing participant:", userId);
    setParticipants(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      console.log("Updated participants after removal:", Array.from(newMap.entries()));
      return newMap;
    });
  }, []);

  useEffect(() => {
    mounted.current = true;
    console.log("Setting up room presence for room:", roomId);
    
    const setupPresence = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !mounted.current) return;

        const channel = supabase.channel(`room:${roomId}`)
          .on('presence', { event: 'sync' }, () => {
            if (!mounted.current) return;
            const state = channel.presenceState();
            console.log('Presence state synced:', state);
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            if (!mounted.current) return;
            console.log('Presence join:', key, newPresences);
            newPresences.forEach((presence: any) => {
              if (presence.user_id) {
                addParticipant(presence.user_id);
              }
            });
          })
          .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            if (!mounted.current) return;
            console.log('Presence leave:', key, leftPresences);
            leftPresences.forEach((presence: any) => {
              if (presence.user_id) {
                removeParticipant(presence.user_id);
              }
            });
          });

        channelRef.current = channel;

        const status = await channel.subscribe((status: string) => {
          console.log("Channel subscription status:", status);
          if (status === 'SUBSCRIBED' && mounted.current) {
            channel.track({
              user_id: user.id,
              username: userName,
              online_at: new Date().toISOString(),
            });
          }
        });
      } catch (error) {
        console.error("Error setting up presence:", error);
      }
    };

    setupPresence();

    return () => {
      console.log("Cleaning up room presence");
      mounted.current = false;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [roomId, userName, addParticipant, removeParticipant]);

  return { participants, addParticipant, removeParticipant };
};