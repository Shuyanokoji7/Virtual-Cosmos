import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useCosmosStore } from '../store';

export const useSocket = () => {
  const SOCKET_URL = import.meta.env.VITE_API_URL;
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
    if (!SOCKET_URL) {
      console.warn("No backend URL set");
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('🔌 Connected to server');
      });

      socket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
      });

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

      socket.on('users:existing', setUsers);
      socket.on('user:new', addUser);
      socket.on('user:left', (data) => removeUser(data.odestined));

      socket.on('user:moved', (data) => {
        updateUserPosition(
          data.odestined,
          data.position,
          data.direction,
          data.isSitting
        );
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

      socket.on('room:created', addRoom);

      socket.on('room:error', (data) => {
        alert(data.message);
      });

      socket.on('proximity:connect', (data) => {
        addProximityUser(
          { odestined: data.userId, name: data.userName },
          data.chatRoomId
        );
      });

      socket.on('proximity:disconnect', (data) => {
        removeProximityUser(data.userId);
      });

      socket.on('chat:message', (message) => {
        addMessage(message.roomId, message);
      });

      socket.on('chat:history', (data) => {
        setMessages(data.roomId, data.messages);
      });

      socket.on('chat:unread', (data) => {
        setUnreadCount(data.roomId, data.count);
      });

      socket.on('user:blocked', (data) => blockUser(data.userId));
      socket.on('user:unblocked', (data) => unblockUser(data.userId));

      socket.on('vote:update', (data) => {
        updateVoteKick(
          data.targetUserId,
          data.voteCount,
          data.threshold,
          data.voters
        );
      });

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
        window.dispatchEvent(new CustomEvent('webrtc:answer', { detail: data }));
      });

      socket.on('webrtc:ice-candidate', (data) => {
        window.dispatchEvent(new CustomEvent('webrtc:ice-candidate', { detail: data }));
      });

      socket.on('webrtc:end', clearCall);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [SOCKET_URL]);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler);
  }, []);

  return {
    socket: socketRef.current,
    emit,
    on,
    off,
  };
};