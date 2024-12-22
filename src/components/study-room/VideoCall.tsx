import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Participant, VideoCallProps } from "@/types/video-call";
import { ParticipantVideo } from "./ParticipantVideo";
import { Controls } from "./Controls";

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

    // Cleanup function to stop all tracks when component unmounts
    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        if (localStream.current) {
          localStream.current.getTracks().forEach(track => {
            track.stop();
          });
        }

        const constraints = {
          video: !isVoiceOnly && isVideoEnabled,
          audio: !isVoiceOnly && isAudioEnabled,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStream.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

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
  }, [roomId, isVoiceOnly, userName, isVideoEnabled, isAudioEnabled]);

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
    // Stop all tracks before leaving
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        track.stop();
      });
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ParticipantVideo
          participant={{ id: "local", stream: localStream.current }}
          isLocal={true}
          userName={userName}
          audioLevel={audioLevel}
          isAudioEnabled={isAudioEnabled && !isVoiceOnly}
        />

        {Array.from(participants.values()).map((participant) => (
          <ParticipantVideo
            key={participant.id}
            participant={participant}
            userName={participant.username}
            audioLevel={0} // Remote participants' audio level would need WebRTC data
            isAudioEnabled={!isVoiceOnly}
          />
        ))}
      </div>

      <Controls
        isVoiceOnly={isVoiceOnly}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onLeaveCall={handleLeaveCall}
      />
    </div>
  );
};

export default VideoCall;
