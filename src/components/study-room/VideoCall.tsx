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

interface Participant {
  id: string;
  stream?: MediaStream;
  videoRef?: HTMLVideoElement | null;
}

const VideoCall = ({ roomId, isVoiceOnly = false }: VideoCallProps) => {
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(!isVoiceOnly);
  const [isVideoEnabled, setIsVideoEnabled] = useState(!isVoiceOnly);
  const [userName, setUserName] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const animationFrame = useRef<number>();
  const localStream = useRef<MediaStream | null>(null);

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
        const constraints = {
          video: !isVoiceOnly,
          audio: !isVoiceOnly, // Only enable audio for study rooms
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStream.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize audio analysis for study rooms
        if (!isVoiceOnly) {
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
        }

        // Subscribe to room participants
        const channel = supabase.channel(`room:${roomId}`)
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            updateParticipants(state);
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('User joined:', newPresences);
          })
          .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('User left:', leftPresences);
            removeParticipant(key);
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await channel.track({
                  user_id: user.id,
                  username: userName,
                  online_at: new Date().toISOString(),
                });
              }
            }
          });

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initializeMedia();

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [roomId, isVoiceOnly, userName]);

  const updateParticipants = (state: any) => {
    const newParticipants = new Map(participants);
    Object.keys(state).forEach(key => {
      const presence = state[key][0];
      if (!newParticipants.has(presence.user_id)) {
        newParticipants.set(presence.user_id, {
          id: presence.user_id,
          username: presence.username,
        });
      }
    });
    setParticipants(newParticipants);
  };

  const removeParticipant = (userId: string) => {
    const newParticipants = new Map(participants);
    newParticipants.delete(userId);
    setParticipants(newParticipants);
  };

  const toggleAudio = () => {
    if (!isVoiceOnly && localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const toggleVideo = () => {
    if (!isVoiceOnly && localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const handleLeaveCall = async () => {
    // Stop all tracks
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }

    // Remove from room participants
    await supabase
      .from("room_participants")
      .delete()
      .eq("room_id", roomId)
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

    navigate("/dashboard/study-room");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Local video */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
            {userName} (You)
          </div>
        </div>

        {/* Remote participants */}
        {Array.from(participants.values()).map((participant) => (
          <div key={participant.id} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {participant.stream ? (
              <video
                ref={(el) => {
                  if (el && participant.stream) {
                    el.srcObject = participant.stream;
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-muted-foreground">{participant.username || 'Anonymous'}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
        {!isVoiceOnly && (
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleAudio}
            className={!isAudioEnabled ? "bg-destructive hover:bg-destructive" : ""}
          >
            {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
        )}
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleVideo}
          className={!isVideoEnabled ? "bg-destructive hover:bg-destructive" : ""}
        >
          {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleLeaveCall}
        >
          <UserMinus className="h-4 w-4" />
        </Button>
      </div>

      {isAudioEnabled && !isVoiceOnly && (
        <div className="flex items-center gap-2 px-4">
          <Mic className="h-4 w-4 text-muted-foreground" />
          <Progress value={audioLevel} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default VideoCall;