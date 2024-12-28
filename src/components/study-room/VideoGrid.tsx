import { ParticipantVideo } from "./ParticipantVideo";
import { Participant } from "@/types/video-call";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [userProfiles, setUserProfiles] = useState<Map<string, string>>(new Map());
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      const participantIds = Array.from(participants.keys());
      if (participantIds.length === 0) return;

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', participantIds);

      if (!error && profiles) {
        const profileMap = new Map();
        profiles.forEach(profile => {
          profileMap.set(profile.id, profile.full_name || 'Anonymous');
        });
        setUserProfiles(profileMap);
      }
    };

    fetchUserProfiles();
  }, [participants]);

  console.log("VideoGrid rendering with participants:", {
    total: participants.size,
    currentUserId,
    participantIds: Array.from(participants.keys())
  });
  
  // Get all participants excluding local user
  const remoteParticipants = Array.from(participants.values())
    .filter(p => p.id !== currentUserId && p.stream);
  
  // Calculate grid layout
  const totalParticipants = remoteParticipants.length + (localStream ? 1 : 0);
  
  console.log("Participants breakdown:", {
    total: totalParticipants,
    remote: remoteParticipants.length,
    hasLocalStream: !!localStream
  });

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
              username: userName,
              isAudioEnabled,
              isVideoEnabled: true
            }}
            isLocal={true}
            userName={userName}
            audioLevel={audioLevel}
            isAudioEnabled={isAudioEnabled}
          />
        </div>
      )}
      
      {remoteParticipants.map((participant) => (
        <div key={participant.id} className="relative aspect-video">
          <ParticipantVideo
            participant={participant}
            userName={userProfiles.get(participant.id) || participant.username || 'Anonymous'}
            audioLevel={0}
            isAudioEnabled={participant.isAudioEnabled}
          />
        </div>
      ))}
    </div>
  );
};