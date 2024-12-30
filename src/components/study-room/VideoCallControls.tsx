import { Button } from "@/components/ui/button";

interface VideoCallControlsProps {
  isDailyEnabled: boolean;
  isZoomEnabled: boolean;
  isZoomError: boolean;
  onDailyStart: () => void;
  onZoomStart: () => void;
}

export const VideoCallControls = ({
  isDailyEnabled,
  isZoomEnabled,
  isZoomError,
  onDailyStart,
  onZoomStart
}: VideoCallControlsProps) => {
  return (
    <div className="flex justify-end gap-2 mb-4">
      <Button
        variant="outline"
        onClick={onDailyStart}
        disabled={isDailyEnabled}
      >
        {isDailyEnabled ? "Video Call Active" : "Start Video Call"}
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