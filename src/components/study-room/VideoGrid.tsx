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
  const gridCols = participants.size <= 1 ? 1 : 
                   participants.size <= 4 ? 2 : 
                   participants.size <= 9 ? 3 : 4;

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
      {Array.from(participants.entries()).map(([id, participant]) => (
        id !== "local" && (
          <ParticipantVideo
            key={id}
            participant={participant}
            userName={participant.username}
            audioLevel={0}
            isAudioEnabled={true}
          />
        )
      ))}
    </div>
  );
};