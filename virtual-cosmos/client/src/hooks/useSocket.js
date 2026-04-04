import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useCosmosStore } from '../store';

const SOCKET_URL = 'http://localhost:3001';

export const useSocket = () => {
  const socketRef = useRef(null);
  const store = useCosmosStore();

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        console.log('✅ Connected to server');
      });

      socket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
      });

      // User events
      socket.on('user:joined', (data) => {
        store.setUser(data);
        store.setRooms(data.rooms);
        store.setBackgroundTypes(data.backgroundTypes);
      });

      socket.on('users:existing', (users) => {
        store.setUsers(users);
      });

      socket.on('user:new', (user) => {
        store.addUser(user);
      });

      socket.on('user:moved', (data) => {
        store.updateUserPosition(data.odestined, data.position, data.direction, data.isSitting);
      });

      socket.on('user:sat', (data) => {
        store.updateUserPosition(data.odestined, data.position, data.direction, true);
      });

      socket.on('user:stood', (data) => {
        store.updateUserPosition(data.odestined, null, null, false);
      });

      socket.on('user:left', (data) => {
        store.removeUser(data.odestined);
      });

      socket.on('user:kicked', (data) => {
        alert(data.reason);
        window.location.reload();
      });

      // Proximity events
      socket.on('proximity:connect', (data) => {
        const user = store.users.find(u => u.odestined === data.userId);
        if (user) {
          store.addProximityUser({ ...user, userName: data.userName }, data.chatRoomId);
        } else {
          store.addProximityUser({ odestined: data.userId, name: data.userName }, data.chatRoomId);
        }
      });

      socket.on('proximity:disconnect', (data) => {
        store.removeProximityUser(data.userId);
      });

      // Chat events
      socket.on('chat:message', (message) => {
        store.addMessage(message.roomId, message);
      });

      socket.on('chat:history', (data) => {
        store.setMessages(data.roomId, data.messages);
      });

      socket.on('chat:unread', (data) => {
        store.setUnreadCount(data.roomId, data.count);
      });

      // Block events
      socket.on('user:blocked', (data) => {
        store.blockUser(data.userId);
      });

      socket.on('user:unblocked', (data) => {
        store.unblockUser(data.userId);
      });

      // Room events
      socket.on('room:created', (room) => {
        store.addRoom(room);
      });

      socket.on('room:create:success', (room) => {
        console.log('Room created:', room);
      });

      socket.on('room:error', (data) => {
        alert(data.message);
      });

      // Vote kick events
      socket.on('vote:update', (data) => {
        store.updateVoteKick(data.targetUserId, data.voteCount, data.threshold, data.voters);
      });

      // WebRTC events are handled in useWebRTC hook
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

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  return {
    socket: socketRef.current,
    emit,
    on,
    off,
  };
};
