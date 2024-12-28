import { useState, useEffect, useCallback, useRef } from "react";

export const useMediaStream = (isVoiceOnly: boolean = false) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initializeMedia = useCallback(async () => {
    try {
      if (streamRef.current) {
        console.log("Cleaning up existing stream");
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          streamRef.current?.removeTrack(track);
        });
      }

      console.log("Requesting media with constraints");
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
          latency: 0
        },
        video: !isVoiceOnly ? {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user'
        } : false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Media stream obtained:", newStream.getTracks().map(t => ({
        kind: t.kind,
        enabled: t.enabled,
        id: t.id,
        readyState: t.readyState,
        muted: t.muted
      })));

      // Set up track event listeners
      newStream.getTracks().forEach(track => {
        track.enabled = true;
        
        track.addEventListener('ended', () => {
          console.log(`Track ${track.id} ended`);
          if (track.kind === 'video' && !isVoiceOnly) {
            setIsVideoEnabled(false);
          } else if (track.kind === 'audio') {
            setIsAudioEnabled(false);
          }
        });

        track.addEventListener('mute', () => {
          console.log(`Track ${track.id} muted`);
          if (track.kind === 'audio') {
            setIsAudioEnabled(false);
          }
        });

        track.addEventListener('unmute', () => {
          console.log(`Track ${track.id} unmuted`);
          if (track.kind === 'audio') {
            setIsAudioEnabled(true);
          }
        });
      });

      streamRef.current = newStream;
      setStream(newStream);
      setIsAudioEnabled(true);
      setIsVideoEnabled(!isVoiceOnly);

      // Set up audio level monitoring
      if (newStream.getAudioTracks().length > 0) {
        const context = new AudioContext();
        const source = context.createMediaStreamSource(newStream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        setAudioContext(context);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let animationFrame: number;

        const updateAudioLevel = () => {
          if (context.state === 'closed') return;
          
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel((average / 255) * 100);
          
          animationFrame = requestAnimationFrame(updateAudioLevel);
        };

        updateAudioLevel();

        return () => {
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
          }
        };
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  }, [isVoiceOnly]);

  const stopAllTracks = useCallback(() => {
    console.log("Stopping all media tracks");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        streamRef.current?.removeTrack(track);
      });
      setStream(null);
      setIsAudioEnabled(false);
      setIsVideoEnabled(false);
      setAudioLevel(0);
      
      if (audioContext) {
        audioContext.close();
        setAudioContext(null);
      }
    }
  }, [audioContext]);

  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        console.log("Audio track toggled:", {
          enabled: audioTrack.enabled,
          readyState: audioTrack.readyState,
          muted: audioTrack.muted
        });
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log("Video track toggled:", {
          enabled: videoTrack.enabled,
          readyState: videoTrack.readyState,
          muted: videoTrack.muted
        });
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAllTracks();
    };
  }, [stopAllTracks]);

  return {
    localStream: stream,
    isAudioEnabled,
    isVideoEnabled,
    audioLevel,
    toggleAudio,
    toggleVideo,
    initializeMedia,
    stopAllTracks,
  };
};