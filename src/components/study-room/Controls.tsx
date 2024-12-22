import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, UserMinus } from "lucide-react";
import { ControlsProps } from "@/types/video-call";

export const Controls = ({
  isVoiceOnly,
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onLeaveCall,
}: ControlsProps) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
      {!isVoiceOnly && (
        <Button
          variant="secondary"
          size="icon"
          onClick={onToggleAudio}
          className={!isAudioEnabled ? "bg-destructive hover:bg-destructive" : ""}
        >
          {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
      )}
      <Button
        variant="secondary"
        size="icon"
        onClick={onToggleVideo}
        className={!isVideoEnabled ? "bg-destructive hover:bg-destructive" : ""}
      >
        {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
      </Button>
      <Button variant="destructive" size="icon" onClick={onLeaveCall}>
        <UserMinus className="h-4 w-4" />
      </Button>
    </div>
  );
};