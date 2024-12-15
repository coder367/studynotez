import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, Mic, MicOff, VideoOff } from "lucide-react";

interface VideoCallProps {
  roomId: string;
  isVoiceOnly?: boolean;
}

const VideoCall = ({ roomId, isVoiceOnly = false }: VideoCallProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(!isVoiceOnly);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: !isVoiceOnly,
          audio: true,
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initializeMedia();

    return () => {
      // Cleanup media streams
      if (localVideoRef.current?.srcObject) {
        const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isVoiceOnly]);

  const toggleAudio = () => {
    if (localVideoRef.current?.srcObject) {
      const audioTrack = (localVideoRef.current.srcObject as MediaStream)
        .getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (!isVoiceOnly && localVideoRef.current?.srcObject) {
      const videoTrack = (localVideoRef.current.srcObject as MediaStream)
        .getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        {!isVoiceOnly && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleAudio}
            className={!isAudioEnabled ? "bg-destructive hover:bg-destructive" : ""}
          >
            {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          {!isVoiceOnly && (
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleVideo}
              className={!isVideoEnabled ? "bg-destructive hover:bg-destructive" : ""}
            >
              {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;