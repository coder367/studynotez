import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, UserMinus } from "lucide-react";
import { ControlsProps } from "@/types/video-call";
import { useToast } from "@/hooks/use-toast";

export const Controls = ({
  isVoiceOnly,
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onLeaveCall,
}: ControlsProps) => {
  const { toast } = useToast();

  const handleToggleAudio = () => {
    onToggleAudio();
    toast({
      title: isAudioEnabled ? "Microphone disabled" : "Microphone enabled",
      duration: 1500,
    });
  };

  const handleToggleVideo = () => {
    onToggleVideo();
    toast({
      title: isVideoEnabled ? "Camera disabled" : "Camera enabled",
      duration: 1500,
    });
  };

  const handleLeaveCall = () => {
    onLeaveCall();
    toast({
      title: "Leaving call...",
      duration: 1500,
    });
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
      {!isVoiceOnly && (
        <Button
          variant="secondary"
          size="icon"
          onClick={handleToggleAudio}
          className={!isAudioEnabled ? "bg-destructive hover:bg-destructive/90" : ""}
        >
          {isAudioEnabled ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>
      )}
      <Button
        variant="secondary"
        size="icon"
        onClick={handleToggleVideo}
        className={!isVideoEnabled ? "bg-destructive hover:bg-destructive/90" : ""}
      >
        {isVideoEnabled ? (
          <Video className="h-4 w-4" />
        ) : (
          <VideoOff className="h-4 w-4" />
        )}
      </Button>
      <Button 
        variant="destructive" 
        size="icon" 
        onClick={handleLeaveCall}
      >
        <UserMinus className="h-4 w-4" />
      </Button>
    </div>
  );
};