export const getRTCConfiguration = (): RTCConfiguration => ({
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
      ],
    },
    {
      urls: ['turn:openrelay.metered.ca:80'],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: ['turn:openrelay.metered.ca:443'],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  iceTransportPolicy: 'all'
});