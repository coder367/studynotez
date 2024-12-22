import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Participant } from "@/types/video-call";

export const useRoomPresence = (roomId: string, userName: string) => {
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        updateParticipants(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
        removeParticipant(key);
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
  }, [roomId, userName]);

  const updateParticipants = (state: any) => {
    const newParticipants = new Map(participants);
    Object.keys(state).forEach(key => {
      const presence = state[key][0];
      if (!newParticipants.has(presence.user_id)) {
        newParticipants.set(presence.user_id, {
          id: presence.user_id,
          username: presence.username,
        });
      }
    });
    setParticipants(newParticipants);
  };

  const removeParticipant = (userId: string) => {
    const newParticipants = new Map(participants);
    newParticipants.delete(userId);
    setParticipants(newParticipants);
  };

  return { participants };
};