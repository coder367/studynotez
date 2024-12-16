import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, Mic, MicOff, VideoOff, UserMinus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface VideoCallProps {
  roomId: string;
  isVoiceOnly?: boolean;
}

const VideoCall = ({ roomId, isVoiceOnly = false }: VideoCallProps) => {
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(!isVoiceOnly);
  const [userName, setUserName] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const animationFrame = useRef<number>();

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profile) {
          setUserName(profile.full_name || "Anonymous");
        }
      }
    };

    fetchUserName();
  }, []);

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

        // Initialize audio analysis
        audioContext.current = new AudioContext();
        analyser.current = audioContext.current.createAnalyser();
        const source = audioContext.current.createMediaStreamSource(stream);
        source.connect(analyser.current);
        analyser.current.fftSize = 256;
        const bufferLength = analyser.current.frequencyBinCount;
        dataArray.current = new Uint8Array(bufferLength);

        const updateAudioLevel = () => {
          if (analyser.current && dataArray.current) {
            analyser.current.getByteFrequencyData(dataArray.current);
            const average = dataArray.current.reduce((a, b) => a + b) / dataArray.current.length;
            setAudioLevel(Math.min(100, (average / 128) * 100));
          }
          animationFrame.current = requestAnimationFrame(updateAudioLevel);
        };
        updateAudioLevel();
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initializeMedia();

    return () => {
      if (localVideoRef.current?.srcObject) {
        const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
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

  const handleLeaveCall = async () => {
    if (localVideoRef.current?.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }

    await supabase
      .from("room_participants")
      .delete()
      .eq("room_id", roomId)
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

    navigate("/dashboard/study-room");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        {!isVoiceOnly && (
          <>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
              {userName}
            </div>
          </>
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
          <Button
            variant="destructive"
            size="icon"
            onClick={handleLeaveCall}
          >
            <UserMinus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {isAudioEnabled && (
        <div className="flex items-center gap-2 px-4">
          <Mic className="h-4 w-4 text-muted-foreground" />
          <Progress value={audioLevel} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default VideoCall;