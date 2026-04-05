import { useEffect, useRef, useCallback } from 'react';
import { useCosmosStore } from '../store';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const useWebRTC = (socket) => {
  const peerConnectionsRef = useRef({});
  const store = useCosmosStore();

  const createPeerConnection = useCallback((targetUserId) => {
    if (peerConnectionsRef.current[targetUserId]) {
      return peerConnectionsRef.current[targetUserId];
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc:ice-candidate', {
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      store.addRemoteStream(targetUserId, stream);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        closePeerConnection(targetUserId);
      }
    };

    peerConnectionsRef.current[targetUserId] = pc;
    return pc;
  }, [socket, store]);

  const closePeerConnection = useCallback((targetUserId) => {
    const pc = peerConnectionsRef.current[targetUserId];
    if (pc) {
      pc.close();
      delete peerConnectionsRef.current[targetUserId];
      store.removeRemoteStream(targetUserId);
    }
  }, [store]);

  const startCall = useCallback(async (targetUserId, type = 'video') => {
    try {
      const constraints = type === 'video' 
        ? { video: true, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      store.setLocalStream(stream);
      store.setActiveCall({ targetUserId, type });

      const pc = createPeerConnection(targetUserId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socket) {
        socket.emit('webrtc:offer', {
          targetUserId,
          offer,
          type,
        });
      }
    } catch (err) {
      console.error('Error starting call:', err);
      alert('Could not access camera/microphone');
    }
  }, [socket, store, createPeerConnection]);

  const answerCall = useCallback(async (fromUserId, offer, type) => {
    try {
      const constraints = type === 'video'
        ? { video: true, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      store.setLocalStream(stream);
      store.setActiveCall({ targetUserId: fromUserId, type });

      const pc = createPeerConnection(fromUserId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socket) {
        socket.emit('webrtc:answer', {
          targetUserId: fromUserId,
          answer,
        });
      }
    } catch (err) {
      console.error('Error answering call:', err);
    }
  }, [socket, store, createPeerConnection]);

  const handleAnswer = useCallback(async (fromUserId, answer) => {
    const pc = peerConnectionsRef.current[fromUserId];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }, []);

  const handleIceCandidate = useCallback(async (fromUserId, candidate) => {
    const pc = peerConnectionsRef.current[fromUserId];
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  const endCall = useCallback((targetUserId) => {
    closePeerConnection(targetUserId);
    
    const localStream = store.localStream;
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    store.clearCall();

    if (socket) {
      socket.emit('webrtc:end', { targetUserId });
    }
  }, [socket, store, closePeerConnection]);

  const toggleMute = useCallback(() => {
    const localStream = store.localStream;
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return true;
  }, [store]);

  const toggleVideo = useCallback(() => {
    const localStream = store.localStream;
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return true;
  }, [store]);

  // Set up socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleOffer = ({ offer, fromUserId, fromUserName, type }) => {
      const accept = window.confirm(`${fromUserName} is calling you (${type}). Accept?`);
      if (accept) {
        answerCall(fromUserId, offer, type);
      }
    };

    const handleAnswerEvent = ({ answer, fromUserId }) => {
      handleAnswer(fromUserId, answer);
    };

    const handleIceCandidateEvent = ({ candidate, fromUserId }) => {
      handleIceCandidate(fromUserId, candidate);
    };

    const handleEnd = ({ fromUserId }) => {
      closePeerConnection(fromUserId);
      const localStream = store.localStream;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      store.clearCall();
    };

    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswerEvent);
    socket.on('webrtc:ice-candidate', handleIceCandidateEvent);
    socket.on('webrtc:end', handleEnd);

    return () => {
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswerEvent);
      socket.off('webrtc:ice-candidate', handleIceCandidateEvent);
      socket.off('webrtc:end', handleEnd);
    };
  }, [socket, answerCall, handleAnswer, handleIceCandidate, closePeerConnection, store]);

  return {
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
};
