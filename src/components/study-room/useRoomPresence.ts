import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Participant } from "@/types/video-call";

export const useRoomPresence = (roomId: string, userName: string) => {
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());

  const addParticipant = useCallback((userId: string, stream?: MediaStream) => {
    setParticipants(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(userId);
      newMap.set(userId, {
        ...existing,
        id: userId,
        stream: stream || existing?.stream,
        username: userName
      });
      return newMap;
    });
  }, [userName]);

  const removeParticipant = useCallback((userId: string) => {
    setParticipants(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  }, []);

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Presence state updated:', state);
        Object.entries(state).forEach(([key, value]) => {
          const presence = value[0] as any;
          addParticipant(presence.user_id);
        });
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
        newPresences.forEach((presence: any) => {
          addParticipant(presence.user_id);
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
        leftPresences.forEach((presence: any) => {
          removeParticipant(presence.user_id);
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
      channel.unsubscribe();
    };
  }, [roomId, userName, addParticipant, removeParticipant]);

  return { participants, addParticipant, removeParticipant };
};