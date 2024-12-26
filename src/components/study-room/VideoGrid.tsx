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
  
  // Filter out duplicates and create a new Map of remote participants
  const remoteParticipants = new Map(
    Array.from(participants.entries()).filter(([id, participant]) => {
      // Only keep remote participants with active streams
      return participant.stream && id !== "local";
    })
  );

  const totalParticipants = remoteParticipants.size + (localStream ? 1 : 0);
  
  // Calculate grid layout
  const gridCols = totalParticipants <= 1 ? 1 : 
                   totalParticipants <= 4 ? 2 : 
                   totalParticipants <= 9 ? 3 : 4;

  console.log("Remote participants:", remoteParticipants.size);
  console.log("Total participants including local:", totalParticipants);

  return (
    <div 
      className="grid gap-4 w-full h-full"
      style={{
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
      }}
    >
      {/* Render local video first */}
      {localStream && (
        <div className="relative aspect-video">
          <ParticipantVideo
            participant={{ id: "local", stream: localStream }}
            isLocal={true}
            userName={userName}
            audioLevel={audioLevel}
            isAudioEnabled={isAudioEnabled}
          />
        </div>
      )}
      
      {/* Render remote participants */}
      {Array.from(remoteParticipants.entries()).map(([id, participant]) => (
        <div key={id} className="relative aspect-video">
          <ParticipantVideo
            participant={participant}
            userName={participant.username}
            audioLevel={0}
            isAudioEnabled={true}
          />
        </div>
      ))}
    </div>
  );
};
