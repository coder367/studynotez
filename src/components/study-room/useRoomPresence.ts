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
      
      // Don't override existing stream if no new stream is provided
      if (existing?.stream && !stream) {
        newMap.set(userId, {
          ...existing,
          id: userId,
          username: userName
        });
      } else {
        // If there's a new stream or no existing entry, set the new data
        newMap.set(userId, {
          id: userId,
          stream: stream || existing?.stream,
          username: userName
        });
      }
      
      console.log("Updated participants:", newMap.size);
      return newMap;
    });
  }, [userName]);

  const removeParticipant = useCallback((userId: string) => {
    console.log("Removing participant:", userId);
    setParticipants(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      console.log("Updated participants after removal:", newMap.size);
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
        const newParticipants = new Map<string, Participant>();
        
        // Add all current participants
        Object.entries(state).forEach(([key, value]) => {
          const presence = value[0] as any;
          if (presence.user_id) {
            const participant = {
              id: presence.user_id,
              username: presence.username,
              stream: undefined
            };
            newParticipants.set(presence.user_id, participant);
          }
        });
        
        // Keep existing streams for participants that are still present
        setParticipants(prev => {
          prev.forEach((participant, userId) => {
            if (newParticipants.has(userId) && participant.stream) {
              newParticipants.set(userId, {
                ...newParticipants.get(userId)!,
                stream: participant.stream
              });
            }
          });
          return newParticipants;
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
