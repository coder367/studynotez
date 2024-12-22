export interface Participant {
  id: string;
  stream?: MediaStream;
  videoRef?: HTMLVideoElement | null;
  username?: string;
}

export interface VideoCallProps {
  roomId: string;
  isVoiceOnly?: boolean;
}

export interface ParticipantVideoProps {
  participant: Participant;
  isLocal?: boolean;
  userName?: string;
}

export interface ControlsProps {
  isVoiceOnly: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onLeaveCall: () => void;
}

export interface AudioLevelIndicatorProps {
  isAudioEnabled: boolean;
  audioLevel: number;
  isVoiceOnly: boolean;
}