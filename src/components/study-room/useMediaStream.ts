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
        stream.getTracks().forEach(track => track.stop());
      }

      console.log("Requesting media permissions...");
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: !isVoiceOnly ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Media stream obtained:", newStream.getTracks().map(t => ({
        kind: t.kind,
        label: t.label,
        enabled: t.enabled
      })));

      setStream(newStream);
      setIsAudioEnabled(true);
      setIsVideoEnabled(!isVoiceOnly);

      // Set up audio level monitoring with proper cleanup
      if (audioContext) {
        audioContext.close();
      }
      
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
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  }, [isVoiceOnly, stream]);

  const stopAllTracks = useCallback(() => {
    console.log("Stopping all media tracks");
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
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
        console.log("Audio track toggled:", audioTrack.enabled);
      }
    }
  }, [stream]);

  const toggleVideo = useCallback(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log("Video track toggled:", videoTrack.enabled);
      }
    }
  }, [stream]);

  useEffect(() => {
    const cleanup = initializeMedia();
    return () => {
      cleanup?.();
      stopAllTracks();
    };
  }, [initializeMedia, stopAllTracks]);

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