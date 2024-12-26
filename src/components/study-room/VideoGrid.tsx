import { ParticipantVideo } from "./ParticipantVideo";
import { Participant } from "@/types/video-call";

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
  console.log("VideoGrid rendering with participants:", participants.size);
  
  // Create array of participants for easier rendering
  const participantArray = Array.from(participants.values());
  const totalParticipants = participantArray.length + (localStream ? 1 : 0);
  
  console.log("Total participants including local:", totalParticipants);
  console.log("Remote participants:", participantArray.length);

  // Calculate grid layout
  const gridCols = totalParticipants <= 1 ? 1 : 
                   totalParticipants <= 4 ? 2 : 
                   totalParticipants <= 9 ? 3 : 4;

  const gridClassName = `grid gap-4 w-full h-full ${
    totalParticipants > 1 ? `grid-cols-1 md:grid-cols-${gridCols}` : 'grid-cols-1'
  }`;

  return (
    <div className={gridClassName}>
      {/* Render local video first */}
      {localStream && (
        <div className="relative aspect-video">
          <ParticipantVideo
            participant={{ 
              id: "local", 
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
      
      {/* Render remote participants */}
      {participantArray.map((participant) => (
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