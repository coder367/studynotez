import { useEffect, useRef, useState, useCallback } from "react";

export const useMediaStream = (isVoiceOnly: boolean) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(!isVoiceOnly);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const localStream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const animationFrame = useRef<number>();

  const stopAllTracks = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        track.stop();
      });
      localStream.current = null;
    }
  };

  const initializeMedia = useCallback(async () => {
    try {
      // Stop existing tracks before requesting new ones
      stopAllTracks();

      const constraints = {
        video: isVideoEnabled ? {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false,
        audio: !isVoiceOnly && isAudioEnabled
      };

      if (!constraints.video && !constraints.audio) {
        console.log("No media requested");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStream.current = stream;

      // Set initial track states
      stream.getVideoTracks().forEach(track => {
        track.enabled = isVideoEnabled;
      });

      if (!isVoiceOnly && stream.getAudioTracks().length > 0) {
        stream.getAudioTracks().forEach(track => {
          track.enabled = isAudioEnabled;
        });

        // Setup audio analysis
        if (audioContext.current) {
          audioContext.current.close();
        }
        
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
  }, [isVoiceOnly, isVideoEnabled, isAudioEnabled]);

  useEffect(() => {
    initializeMedia();

    return () => {
      stopAllTracks();
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, [initializeMedia]);

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
    setIsVideoEnabled(!isVideoEnabled);
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
      // Reinitialize media to handle camera on/off
      initializeMedia();
    }
  };

  return {
    localStream: localStream.current,
    isAudioEnabled,
    isVideoEnabled,
    audioLevel,
    toggleAudio,
    toggleVideo,
    initializeMedia,
    stopAllTracks
  };
};