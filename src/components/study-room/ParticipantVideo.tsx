import { ParticipantVideoProps } from "@/types/video-call";
import { Progress } from "@/components/ui/progress";
import { Mic } from "lucide-react";

export const ParticipantVideo = ({ participant, isLocal, userName, audioLevel, isAudioEnabled }: ParticipantVideoProps) => {
  return (
    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
      {participant.stream ? (
        <video
          ref={(el) => {
            if (el && participant.stream) {
              el.srcObject = participant.stream;
            }
          }}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <span className="text-muted-foreground">{participant.username || userName || 'Anonymous'}</span>
        </div>
      )}
      <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
        {participant.username || userName || 'Anonymous'} {isLocal && '(You)'}
      </div>
      {isAudioEnabled && audioLevel !== undefined && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 px-2 bg-black/50 rounded">
          <Mic className="h-4 w-4 text-white" />
          <Progress value={audioLevel} className="h-2" />
        </div>
      )}
    </div>
  );
};