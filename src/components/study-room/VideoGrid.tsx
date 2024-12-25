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
  // Filter out any duplicate participants and local stream
  const uniqueParticipants = new Map(
    Array.from(participants.entries()).filter(([id, participant]) => {
      return id !== "local" && participant.stream !== localStream;
    })
  );

  const totalParticipants = uniqueParticipants.size + (localStream ? 1 : 0);
  const gridCols = totalParticipants <= 1 ? 1 : 
                   totalParticipants <= 4 ? 2 : 
                   totalParticipants <= 9 ? 3 : 4;

  console.log("Rendering video grid with participants:", uniqueParticipants.size);

  return (
    <div 
      className={`grid gap-4`}
      style={{
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
      }}
    >
      {localStream && (
        <ParticipantVideo
          participant={{ id: "local", stream: localStream }}
          isLocal={true}
          userName={userName}
          audioLevel={audioLevel}
          isAudioEnabled={isAudioEnabled}
        />
      )}
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