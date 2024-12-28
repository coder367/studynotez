import { ParticipantVideo } from "./ParticipantVideo";
import { Participant } from "@/types/video-call";
import { useEffect, useState, useCallback } from "react";
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
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const getParticipantsList = useCallback(() => {
    const remoteParticipants = Array.from(participants.values())
      .filter(p => p.id !== currentUserId && p.stream);

    console.log("Current participants state:", {
      total: participants.size,
      remote: remoteParticipants.length,
      hasLocalStream: !!localStream,
      participantIds: Array.from(participants.keys())
    });

    return remoteParticipants;
  }, [participants, currentUserId, localStream]);

  const remoteParticipants = getParticipantsList();
  const totalParticipants = remoteParticipants.length + (localStream ? 1 : 0);
  
  console.log("Grid layout calculation:", {
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
            userName={participant.username}
            audioLevel={0}
            isAudioEnabled={participant.isAudioEnabled}
          />
        </div>
      ))}
    </div>
  );
};