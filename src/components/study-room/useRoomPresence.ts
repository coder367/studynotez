import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Participant } from "@/types/video-call";

export const useRoomPresence = (roomId: string, userName: string) => {
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());

  const addParticipant = useCallback((userId: string, stream?: MediaStream) => {
    console.log("Adding participant:", userId);
    setParticipants(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(userId);
      if (existing?.stream && !stream) {
        // Don't override existing stream if no new stream is provided
        newMap.set(userId, {
          ...existing,
          id: userId,
          username: userName
        });
      } else {
        newMap.set(userId, {
          ...existing,
          id: userId,
          stream: stream || existing?.stream,
          username: userName
        });
      }
      return newMap;
    });
  }, [userName]);

  const removeParticipant = useCallback((userId: string) => {
    console.log("Removing participant:", userId);
    setParticipants(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  }, []);

  useEffect(() => {
    console.log("Setting up room presence for room:", roomId);
    const channel = supabase.channel(`room:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Presence state updated:', state);
        
        // Clear existing participants first
        setParticipants(new Map());
        
        // Add all current participants
        Object.entries(state).forEach(([key, value]) => {
          const presence = value[0] as any;
          if (presence.user_id) {
            addParticipant(presence.user_id);
          }
        });
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
        newPresences.forEach((presence: any) => {
          if (presence.user_id) {
            addParticipant(presence.user_id);
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
        leftPresences.forEach((presence: any) => {
          if (presence.user_id) {
            removeParticipant(presence.user_id);
          }
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await channel.track({
              user_id: user.id,
              username: userName,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      console.log("Cleaning up room presence");
      channel.unsubscribe();
    };
  }, [roomId, userName, addParticipant, removeParticipant]);

  return { participants, addParticipant, removeParticipant };
};