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
    console.log("Setting up room presence for room:", roomId);
    const channel = supabase.channel(`room:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Presence state updated:', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Presence join:', key, newPresences);
        newPresences.forEach((presence: any) => {
          if (presence.user_id) {
            addParticipant(presence.user_id);
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Presence leave:', key, leftPresences);
        leftPresences.forEach((presence: any) => {
          if (presence.user_id) {
            removeParticipant(presence.user_id);
          }
        });
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Channel subscribed, tracking presence');
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