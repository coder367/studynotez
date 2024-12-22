import { ParticipantVideoProps } from "@/types/video-call";

export const ParticipantVideo = ({ participant, isLocal, userName }: ParticipantVideoProps) => {
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
    </div>
  );
};