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
      return participant.stream && id !== "local";
    })
  );

  const totalParticipants = remoteParticipants.size + (localStream ? 1 : 0);
  console.log("Total participants including local:", totalParticipants);
  console.log("Remote participants:", remoteParticipants.size);

  // Calculate grid layout
  const gridCols = totalParticipants <= 1 ? 1 : 
                   totalParticipants <= 4 ? 2 : 
                   totalParticipants <= 9 ? 3 : 4;

  const gridClassName = `grid gap-4 w-full h-full grid-cols-1 ${
    totalParticipants > 1 && `md:grid-cols-${gridCols}`
  }`;

  return (
    <div className={gridClassName}>
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