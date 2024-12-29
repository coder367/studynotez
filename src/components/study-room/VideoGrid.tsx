import { ParticipantVideo } from "./ParticipantVideo";
import { Participant } from "@/types/video-call";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface VideoGridProps {
  participants: Map<string, Participant>;
  localStream: MediaStream | null;
  userName: string;
  audioLevel: number;
  isAudioEnabled: boolean;
}

export const VideoGrid = ({ 
  participants, 
  localStream, 
  userName, 
  audioLevel, 
  isAudioEnabled 
}: VideoGridProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch profiles for all participants including current user
  const participantIds = Array.from(participants.keys());
  if (currentUserId && !participantIds.includes(currentUserId)) {
    participantIds.push(currentUserId);
  }

  const { data: profiles } = useQuery({
    queryKey: ["participantProfiles", participantIds],
    queryFn: async () => {
      if (participantIds.length === 0) return [];
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", participantIds);
      return data || [];
    },
    enabled: participantIds.length > 0,
    refetchInterval: 5000, // Refresh every 5 seconds to ensure names are up to date
  });

  // Create a map of user IDs to profile names
  const profileNames = new Map(
    profiles?.map(profile => [profile.id, profile.full_name]) || []
  );

  // Get all participants excluding local user
  const remoteParticipants = Array.from(participants.values())
    .filter(p => p.id !== currentUserId);
  
  // Calculate grid layout
  const totalParticipants = remoteParticipants.length + (localStream ? 1 : 0);
  
  const gridCols = totalParticipants <= 1 ? 1 : 
                   totalParticipants <= 4 ? 2 : 
                   totalParticipants <= 9 ? 3 : 4;

  const gridClassName = `grid gap-4 w-full h-full ${
    totalParticipants > 1 ? `grid-cols-1 md:grid-cols-${gridCols}` : 'grid-cols-1'
  }`;

  return (
    <div className={gridClassName}>
      {localStream && currentUserId && (
        <div className="relative aspect-video">
          <ParticipantVideo
            participant={{ 
              id: currentUserId,
              stream: localStream,
              username: profileNames.get(currentUserId) || userName,
              isAudioEnabled,
              isVideoEnabled: true
            }}
            isLocal={true}
            userName={profileNames.get(currentUserId) || userName}
            audioLevel={audioLevel}
            isAudioEnabled={isAudioEnabled}
          />
        </div>
      )}
      
      {remoteParticipants.map((participant) => (
        <div key={participant.id} className="relative aspect-video">
          <ParticipantVideo
            participant={{
              ...participant,
              username: profileNames.get(participant.id) || 'Anonymous'
            }}
            userName={profileNames.get(participant.id) || 'Anonymous'}
            audioLevel={0}
            isAudioEnabled={participant.isAudioEnabled}
          />
        </div>
      ))}
    </div>
  );
};