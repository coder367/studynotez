import { useState, useEffect, useCallback } from "react";

export const useMediaStream = (isVoiceOnly: boolean = false) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const initializeMedia = useCallback(async () => {
    try {
      if (stream) {
        console.log("Cleaning up existing stream");
        stream.getTracks().forEach(track => {
          track.stop();
          stream.removeTrack(track);
        });
      }

      console.log("Requesting media with constraints");
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
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

      // Ensure tracks are properly initialized
      newStream.getTracks().forEach(track => {
        track.enabled = true;
        track.addEventListener('ended', () => {
          console.log(`Track ${track.id} ended`);
        });
      });

      setStream(newStream);
      setIsAudioEnabled(true);
      setIsVideoEnabled(!isVoiceOnly);

      // Set up audio level monitoring with proper cleanup
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
      throw error; // Propagate error for proper handling
    }
  }, [isVoiceOnly, stream]);

  const stopAllTracks = useCallback(() => {
    console.log("Stopping all media tracks");
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        stream.removeTrack(track);
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
  }, [stream, audioContext]);

  const toggleAudio = useCallback(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
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
  }, [stream]);

  const toggleVideo = useCallback(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
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
  }, [stream]);

  // Clean up on unmount
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