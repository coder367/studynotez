import { ParticipantVideoProps } from "@/types/video-call";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef } from "react";

export const ParticipantVideo = ({ 
  participant, 
  isLocal, 
  userName, 
  audioLevel, 
  isAudioEnabled 
}: ParticipantVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && participant.stream) {
      videoElement.srcObject = participant.stream;
      
      const playVideo = async () => {
        try {
          await videoElement.play();
        } catch (error) {
          console.error("Error playing video:", error);
        }
      };

      playVideo();

      return () => {
        if (videoElement.srcObject) {
          videoElement.srcObject = null;
        }
      };
    }
  }, [participant.stream]);

  console.log("Rendering participant video:", {
    id: participant.id,
    isLocal,
    hasStream: !!participant.stream,
    audioLevel
  });

  return (
    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
      {participant.stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <span className="text-muted-foreground">
            {participant.username || userName || 'Anonymous'}
          </span>
        </div>
      )}
      
      <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
        <span className="bg-black/50 px-2 py-1 rounded text-white text-sm">
          {participant.username || userName || 'Anonymous'} {isLocal && '(You)'}
        </span>
        <div className="flex gap-2">
          {isAudioEnabled !== undefined && (
            <div className="bg-black/50 p-1 rounded">
              {isAudioEnabled ? (
                <Mic className="h-4 w-4 text-white" />
              ) : (
                <MicOff className="h-4 w-4 text-white" />
              )}
            </div>
          )}
        </div>
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