export interface Participant {
  id: string;
  stream?: MediaStream;
  videoRef?: HTMLVideoElement | null;
  username?: string;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
}

export interface VideoCallProps {
  roomId: string;
  isVoiceOnly?: boolean;
}

export interface ParticipantVideoProps {
  participant: Participant;
  isLocal?: boolean;
  userName?: string;
  audioLevel?: number;
  isAudioEnabled?: boolean;
}

export interface ControlsProps {
  isVoiceOnly: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onLeaveCall: () => void;
}

export interface VideoCallControlsProps {
  isDailyEnabled: boolean;
  isZoomEnabled: boolean;
  isZoomError: boolean;
  onDailyStart: () => void;
  onZoomStart: () => void;
}

export interface AudioLevelIndicatorProps {
  isAudioEnabled: boolean;
  audioLevel: number;
  isVoiceOnly: boolean;
}