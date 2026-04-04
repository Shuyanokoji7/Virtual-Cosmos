import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

export function useSocket(joined, username) {
  const socketRef = useRef(null);
  const [myData, setMyData] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]);
  const [activeConnections, setActiveConnections] = useState([]);
  const [chatMessages, setChatMessages] = useState({});

  useEffect(() => {
    if (!joined) return;

    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('user:join', { username });
    });

    // My data received
    socket.on('user:joined', (data) => {
      setMyData(data);
    });

    // Existing users
    socket.on('users:existing', (users) => {
      setOtherUsers(users);
    });

    // New user arrived
    socket.on('user:new', (user) => {
      setOtherUsers((prev) => {
        if (prev.find((u) => u.socketId === user.socketId)) return prev;
        return [...prev, user];
      });
    });

    // User moved
    socket.on('user:moved', ({ socketId, x, y }) => {
      setOtherUsers((prev) =>
        prev.map((u) => (u.socketId === socketId ? { ...u, x, y } : u))
      );
    });

    // User left
    socket.on('user:left', ({ socketId }) => {
      setOtherUsers((prev) => prev.filter((u) => u.socketId !== socketId));
      setActiveConnections((prev) =>
        prev.filter((c) => c.peerId !== socketId)
      );
    });

    // Proximity connect
    socket.on('proximity:connect', ({ peerId, peerName, peerColor, roomId }) => {
      setActiveConnections((prev) => {
        if (prev.find((c) => c.roomId === roomId)) return prev;
        return [...prev, { peerId, peerName, peerColor, roomId }];
      });
    });

    // Proximity disconnect
    socket.on('proximity:disconnect', ({ peerId, roomId }) => {
      setActiveConnections((prev) =>
        prev.filter((c) => c.roomId !== roomId)
      );
      // Keep chat history but could clear if desired
    });

    // Chat message
    socket.on('chat:message', ({ roomId, senderId, senderName, content, timestamp }) => {
      setChatMessages((prev) => ({
        ...prev,
        [roomId]: [
          ...(prev[roomId] || []),
          { senderId, senderName, content, timestamp },
        ],
      }));
    });

    // Chat history
    socket.on('chat:history', ({ roomId, messages }) => {
      if (messages.length > 0) {
        setChatMessages((prev) => ({
          ...prev,
          [roomId]: messages,
        }));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [joined, username]);

  const sendPosition = useCallback((x, y) => {
    if (socketRef.current) {
      socketRef.current.emit('user:move', { x, y });
    }
  }, []);

  const sendMessage = useCallback((roomId, content) => {
    if (socketRef.current && content.trim()) {
      socketRef.current.emit('chat:message', { roomId, content: content.trim() });
    }
  }, []);

  return {
    socket: socketRef.current,
    myData,
    otherUsers,
    activeConnections,
    chatMessages,
    sendMessage,
    sendPosition,
  };
}
