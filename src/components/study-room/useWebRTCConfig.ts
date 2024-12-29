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
      // Additional STUN servers for better connectivity
      urls: [
        'stun:stun.stunprotocol.org:3478',
        'stun:stun.voip.blackberry.com:3478',
        'stun:stun.nextcloud.com:443'
      ]
    },
    {
      // Production-grade TURN servers from Metered
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
      // Backup TURN servers
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
  rtcpMuxPolicy: 'require',
});