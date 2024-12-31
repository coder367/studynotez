export const getRTCConfiguration = (): RTCConfiguration => ({
  iceServers: [
    // Google's public STUN servers
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
      ],
    },
    {
      // Metered TURN servers - more reliable for cross-network connections
      urls: [
        'turn:a.relay.metered.ca:80',
        'turn:a.relay.metered.ca:80?transport=tcp',
        'turn:a.relay.metered.ca:443',
        'turn:a.relay.metered.ca:443?transport=tcp',
      ],
      username: 'e8dd65441fc6e40f9abde782',
      credential: 'L8uT/bEFxNbhvMK/',
    },
    {
      // Additional backup TURN servers
      urls: [
        'turn:b.relay.metered.ca:80',
        'turn:b.relay.metered.ca:80?transport=tcp',
        'turn:b.relay.metered.ca:443',
        'turn:b.relay.metered.ca:443?transport=tcp',
      ],
      username: 'e8dd65441fc6e40f9abde782',
      credential: 'L8uT/bEFxNbhvMK/',
    }
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require'
});