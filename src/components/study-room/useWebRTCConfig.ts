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
      // OpenRelay TURN servers - more reliable for cross-network connections
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp',
        'turn:openrelay.metered.ca:80?transport=tcp',
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      // Additional backup TURN servers
      urls: [
        'turn:relay1.metered.ca:80',
        'turn:relay1.metered.ca:443',
        'turn:relay1.metered.ca:443?transport=tcp',
      ],
      username: 'e8dd65441fc6e40f9abde782',
      credential: 'L8uT/bEFxNbhvMK/',
    }
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  // Additional configuration for better connectivity
  iceServersTransportPolicy: 'all',
  sdpSemantics: 'unified-plan'
});