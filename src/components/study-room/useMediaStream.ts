import { useState, useEffect, useCallback } from "react";

export const useMediaStream = (isVoiceOnly: boolean = false) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);

  const initializeStream = useCallback(async () => {
    try {
      const constraints = {
        audio: !isVoiceOnly,
        video: true,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setIsAudioEnabled(!isVoiceOnly);
      setIsVideoEnabled(true);

      // Set up audio level monitoring if audio is enabled
      if (!isVoiceOnly) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(newStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAudioLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel((average / 255) * 100);
          requestAnimationFrame(updateAudioLevel);
        };
        updateAudioLevel();
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  }, [isVoiceOnly]);

  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
      setIsAudioEnabled(false);
      setIsVideoEnabled(false);
      setAudioLevel(0);
    }
  }, [stream]);

  useEffect(() => {
    initializeStream();
    return cleanup;
  }, [initializeStream, cleanup]);

  const toggleAudio = useCallback(() => {
    if (stream && !isVoiceOnly) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [stream, isVoiceOnly]);

  const toggleVideo = useCallback(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [stream]);

  return {
    stream,
    isAudioEnabled,
    isVideoEnabled,
    audioLevel,
    toggleAudio,
    toggleVideo,
    cleanup,
  };
};