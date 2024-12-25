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
  
  // Create a new Map excluding the local participant and any duplicates
  const uniqueParticipants = new Map(
    Array.from(participants.entries()).filter(([id, participant]) => {
      // Filter out local participant and any participant with the same stream as local
      return id !== "local" && participant.stream !== localStream;
    })
  );

  const totalParticipants = uniqueParticipants.size + (localStream ? 1 : 0);
  
  // Calculate grid columns based on participant count
  const gridCols = totalParticipants <= 1 ? 1 : 
                   totalParticipants <= 4 ? 2 : 
                   totalParticipants <= 9 ? 3 : 4;

  console.log("Rendering grid with unique participants:", uniqueParticipants.size);
  console.log("Total participants including local:", totalParticipants);

  return (
    <div 
      className={`grid gap-4 w-full`}
      style={{
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
      }}
    >
      {/* Render local video first */}
      {localStream && (
        <ParticipantVideo
          participant={{ id: "local", stream: localStream }}
          isLocal={true}
          userName={userName}
          audioLevel={audioLevel}
          isAudioEnabled={isAudioEnabled}
        />
      )}
      
      {/* Render remote participants */}
      {Array.from(uniqueParticipants.entries()).map(([id, participant]) => (
        <ParticipantVideo
          key={id}
          participant={participant}
          userName={participant.username}
          audioLevel={0}
          isAudioEnabled={true}
        />
      ))}
    </div>
  );
};