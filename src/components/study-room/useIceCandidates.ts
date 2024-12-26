import { useRef, useCallback } from 'react';

export const useIceCandidates = () => {
  const iceCandidatesQueue = useRef(new Map<string, RTCIceCandidate[]>());

  const addIceCandidate = useCallback(async (
    peerId: string,
    candidate: RTCIceCandidate,
    peerConnection?: RTCPeerConnection
  ) => {
    console.log('Adding ICE candidate for peer:', peerId);
    
    if (!peerConnection?.remoteDescription) {
      console.log('Queueing ICE candidate - no remote description yet');
      const queue = iceCandidatesQueue.current.get(peerId) || [];
      queue.push(candidate);
      iceCandidatesQueue.current.set(peerId, queue);
      return;
    }

    try {
      await peerConnection.addIceCandidate(candidate);
      console.log('ICE candidate added successfully');
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, []);

  const processQueuedCandidates = useCallback(async (
    peerId: string,
    peerConnection: RTCPeerConnection
  ) => {
    const queuedCandidates = iceCandidatesQueue.current.get(peerId) || [];
    
    if (peerConnection?.remoteDescription && queuedCandidates.length > 0) {
      console.log(`Processing ${queuedCandidates.length} queued candidates for:`, peerId);
      
      for (const candidate of queuedCandidates) {
        try {
          await peerConnection.addIceCandidate(candidate);
          console.log('Queued ICE candidate added successfully');
        } catch (error) {
          console.error('Error adding queued ICE candidate:', error);
        }
      }
      
      iceCandidatesQueue.current.delete(peerId);
    }
  }, []);

  return {
    addIceCandidate,
    processQueuedCandidates,
    iceCandidatesQueue
  };
};