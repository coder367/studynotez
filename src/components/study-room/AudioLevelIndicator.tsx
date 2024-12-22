import { Mic } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AudioLevelIndicatorProps } from "@/types/video-call";

export const AudioLevelIndicator = ({ isAudioEnabled, audioLevel, isVoiceOnly }: AudioLevelIndicatorProps) => {
  if (!isAudioEnabled || isVoiceOnly) return null;

  return (
    <div className="flex items-center gap-2 px-4">
      <Mic className="h-4 w-4 text-muted-foreground" />
      <Progress value={audioLevel} className="h-2" />
    </div>
  );
};