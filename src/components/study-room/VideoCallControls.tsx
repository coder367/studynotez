import { Button } from "@/components/ui/button";
import { VideoCallControlsProps } from "@/types/video-call";

export const VideoCallControls = ({
  isDailyEnabled,
  isZoomEnabled,
  isZoomError,
  onDailyStart,
  onZoomStart,
}: VideoCallControlsProps) => {
  return (
    <div className="flex justify-end gap-4 mb-4">
      <Button
        variant="outline"
        onClick={onDailyStart}
        disabled={isDailyEnabled}
      >
        {isDailyEnabled ? "Daily Call Active" : "Start Daily Call"}
      </Button>
      <Button
        variant="outline"
        onClick={onZoomStart}
        disabled={isZoomEnabled || isZoomError}
      >
        {isZoomEnabled ? "Zoom Meeting Active" : "Start Zoom Meeting"}
      </Button>
    </div>
  );
};