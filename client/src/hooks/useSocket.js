import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useCosmosStore } from '../store';

const SOCKET_URL = import.meta.env.VITE_API_URL || null;
if (!SOCKET_URL) {
  console.warn("No backend URL set");
  return;
}

export const useSocket = () => {
  const socketRef = useRef(null);
  const {
    setUser,
    setUsers,
    addUser,
    removeUser,
    updateUserPosition,
    setRooms,
    addRoom,
    setBackgroundTypes,
    addProximityUser,
    removeProximityUser,
    addMessage,
    setMessages,
    setUnreadCount,
    blockUser,
    unblockUser,
    updateVoteKick,
    setActiveCall,
    clearCall,
  } = useCosmosStore();

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        console.log('🔌 Connected to server');
      });

      socket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
      });

      // User events
      socket.on('user:joined', (data) => {
        setUser({
          odestined: data.odestined,
          name: data.name,
          avatar: data.avatar,
          position: data.position,
          direction: data.direction,
        });
        setRooms(data.rooms || []);
        setBackgroundTypes(data.backgroundTypes || []);
      });

      socket.on('users:existing', (users) => {
        setUsers(users);
      });

      socket.on('user:new', (user) => {
        addUser(user);
      });

      socket.on('user:left', (data) => {
        removeUser(data.odestined);
      });

      socket.on('user:moved', (data) => {
        updateUserPosition(data.odestined, data.position, data.direction, data.isSitting);
      });

      socket.on('user:sat', (data) => {
        updateUserPosition(data.odestined, data.position, data.direction, true);
      });

      socket.on('user:stood', (data) => {
        updateUserPosition(data.odestined, null, null, false);
      });

      socket.on('user:kicked', (data) => {
        alert(data.reason);
        window.location.reload();
      });

      // Room events
      socket.on('room:created', (room) => {
        addRoom(room);
      });

      socket.on('room:error', (data) => {
        alert(data.message);
      });

      // Proximity events
      socket.on('proximity:connect', (data) => {
        const { userId, userName, chatRoomId } = data;
        addProximityUser({ odestined: userId, name: userName }, chatRoomId);
      });

      socket.on('proximity:disconnect', (data) => {
        removeProximityUser(data.userId);
      });

      // Chat events
      socket.on('chat:message', (message) => {
        addMessage(message.roomId, message);
      });

      socket.on('chat:history', (data) => {
        setMessages(data.roomId, data.messages);
      });

      socket.on('chat:unread', (data) => {
        setUnreadCount(data.roomId, data.count);
      });

      // Block events
      socket.on('user:blocked', (data) => {
        blockUser(data.userId);
      });

      socket.on('user:unblocked', (data) => {
        unblockUser(data.userId);
      });

      // Vote kick events
      socket.on('vote:update', (data) => {
        updateVoteKick(data.targetUserId, data.voteCount, data.threshold, data.voters);
      });

      // WebRTC events
      socket.on('webrtc:offer', (data) => {
        setActiveCall({
          type: data.type,
          fromUserId: data.fromUserId,
          fromUserName: data.fromUserName,
          offer: data.offer,
          isIncoming: true,
        });
      });

      socket.on('webrtc:answer', (data) => {
        // Handle in VideoCallOverlay component
        window.dispatchEvent(new CustomEvent('webrtc:answer', { detail: data }));
      });

      socket.on('webrtc:ice-candidate', (data) => {
        window.dispatchEvent(new CustomEvent('webrtc:ice-candidate', { detail: data }));
      });

      socket.on('webrtc:end', () => {
        clearCall();
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const off = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  return {
    socket: socketRef.current,
    emit,
    on,
    off,
  };
};
