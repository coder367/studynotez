import { useEffect, useRef, useState } from "react";

export const useMediaStream = (isVoiceOnly: boolean) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(!isVoiceOnly);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const localStream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const animationFrame = useRef<number>();

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        if (localStream.current) {
          localStream.current.getTracks().forEach(track => track.stop());
        }

        const constraints = {
          video: isVideoEnabled,
          // Only enable audio in study rooms, not in focus rooms
          audio: !isVoiceOnly && isAudioEnabled
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStream.current = stream;

        if (!isVoiceOnly && stream.getAudioTracks().length > 0) {
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
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initializeMedia();

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, [isVoiceOnly, isVideoEnabled, isAudioEnabled]);

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
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  return {
    localStream: localStream.current,
    isAudioEnabled,
    isVideoEnabled,
    audioLevel,
    toggleAudio,
    toggleVideo
  };
};