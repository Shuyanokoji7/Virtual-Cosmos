import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed, running in memory-only mode');
  }
};
connectDB();

// MongoDB Schemas
const messageSchema = new mongoose.Schema({
  roomId: String,
  senderId: String,
  senderName: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  isGlobal: { type: Boolean, default: false },
});

const userRoomSchema = new mongoose.Schema({
  ownerId: String,
  ownerName: String,
  roomId: String,
  roomName: String,
  backgroundType: String,
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);
const UserRoom = mongoose.model('UserRoom', userRoomSchema);

// In-memory state
const users = new Map(); // socketId -> user data
const proximityConnections = new Map(); // pairKey -> { userIds, chatRoomId }
const blockedUsers = new Map(); // odestined -> Set of blocked userIds
const voteKicks = new Map(); // targetUserId -> Set of voter userIds
const unreadMessages = new Map(); // odestined -> { roomId: count }
const customRooms = new Map(); // odestined -> room data

// Default rooms configuration
const DEFAULT_ROOMS = [
  {
    id: 'lounge',
    name: 'The Lounge',
    x: 100,
    y: 100,
    width: 500,
    height: 400,
    backgroundType: 'cozy',
    furniture: [
      { type: 'sofa', x: 150, y: 200, rotation: 0, seats: 3 },
      { type: 'chair', x: 400, y: 150, rotation: 45, seats: 1 },
      { type: 'table', x: 280, y: 250, rotation: 0 },
      { type: 'plant', x: 120, y: 350, rotation: 0 },
      { type: 'lamp', x: 450, y: 350, rotation: 0 },
    ],
  },
  {
    id: 'meeting',
    name: 'Meeting Room',
    x: 700,
    y: 100,
    width: 450,
    height: 350,
    backgroundType: 'professional',
    furniture: [
      { type: 'desk', x: 850, y: 200, rotation: 0 },
      { type: 'chair', x: 780, y: 200, rotation: 0, seats: 1 },
      { type: 'chair', x: 920, y: 200, rotation: 180, seats: 1 },
      { type: 'chair', x: 850, y: 130, rotation: 90, seats: 1 },
      { type: 'chair', x: 850, y: 270, rotation: -90, seats: 1 },
      { type: 'whiteboard', x: 1050, y: 180, rotation: 0 },
    ],
  },
  {
    id: 'cafe',
    name: 'Cosmic Café',
    x: 100,
    y: 550,
    width: 480,
    height: 380,
    backgroundType: 'warm',
    furniture: [
      { type: 'cafe_table', x: 200, y: 650, rotation: 0 },
      { type: 'stool', x: 170, y: 650, rotation: 0, seats: 1 },
      { type: 'stool', x: 230, y: 650, rotation: 0, seats: 1 },
      { type: 'cafe_table', x: 380, y: 720, rotation: 0 },
      { type: 'stool', x: 350, y: 720, rotation: 0, seats: 1 },
      { type: 'stool', x: 410, y: 720, rotation: 0, seats: 1 },
      { type: 'counter', x: 450, y: 580, rotation: 0 },
      { type: 'plant', x: 120, y: 880, rotation: 0 },
    ],
  },
];

const ROOM_BACKGROUNDS = ['cozy', 'professional', 'warm', 'cosmic', 'nature', 'minimal', 'retro', 'neon'];

const PROXIMITY_RADIUS = parseInt(process.env.PROXIMITY_RADIUS) || 150;
const VOTE_KICK_THRESHOLD = 0.5; // 50% of online users needed

// Helper functions
const createPairKey = (id1, id2) => [id1, id2].sort().join(':');

const calculateDistance = (pos1, pos2) => {
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
};

const isBlocked = (userId1, userId2) => {
  const blocked1 = blockedUsers.get(userId1) || new Set();
  const blocked2 = blockedUsers.get(userId2) || new Set();
  return blocked1.has(userId2) || blocked2.has(userId1);
};

const checkProximity = (user1, user2) => {
  if (!user1 || !user2 || !user1.position || !user2.position) return;
  if (isBlocked(user1.odestined, user2.odestined)) return;

  const distance = calculateDistance(user1.position, user2.position);
  const pairKey = createPairKey(user1.odestined, user2.odestined);
  const existingConnection = proximityConnections.get(pairKey);

  if (distance < PROXIMITY_RADIUS && !existingConnection) {
    // Create proximity connection
    const chatRoomId = `proximity:${pairKey}`;
    proximityConnections.set(pairKey, {
      userIds: [user1.odestined, user2.odestined],
      chatRoomId,
    });

    // Notify both users
    io.to(user1.socketId).emit('proximity:connect', {
      userId: user2.odestined,
      userName: user2.name,
      chatRoomId,
    });
    io.to(user2.socketId).emit('proximity:connect', {
      userId: user1.odestined,
      userName: user1.name,
      chatRoomId,
    });

    // Send chat history
    sendChatHistory(chatRoomId, [user1.socketId, user2.socketId]);
  } else if (distance >= PROXIMITY_RADIUS && existingConnection) {
    // Remove proximity connection
    proximityConnections.delete(pairKey);

    io.to(user1.socketId).emit('proximity:disconnect', { userId: user2.odestined });
    io.to(user2.socketId).emit('proximity:disconnect', { userId: user1.odestined });
  }
};

const sendChatHistory = async (roomId, socketIds) => {
  try {
    const messages = await Message.find({ roomId })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
    
    socketIds.forEach(socketId => {
      io.to(socketId).emit('chat:history', {
        roomId,
        messages: messages.reverse(),
      });
    });
  } catch (err) {
    console.warn('Could not fetch chat history');
  }
};

const getAllRooms = async () => {
  const userRoomsFromDB = [];
  try {
    const dbRooms = await UserRoom.find().lean();
    dbRooms.forEach(room => {
      userRoomsFromDB.push({
        id: room.roomId,
        name: room.roomName,
        ownerId: room.ownerId,
        ownerName: room.ownerName,
        backgroundType: room.backgroundType,
        isCustom: true,
        x: 700 + Math.random() * 200,
        y: 550 + Math.random() * 100,
        width: 400,
        height: 350,
        furniture: generateRandomFurniture(),
      });
    });
  } catch (err) {
    // Use in-memory rooms
    customRooms.forEach(room => userRoomsFromDB.push(room));
  }
  return [...DEFAULT_ROOMS, ...userRoomsFromDB];
};

const generateRandomFurniture = () => {
  const furnitureTypes = ['chair', 'sofa', 'table', 'plant', 'lamp'];
  const furniture = [];
  const count = 3 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < count; i++) {
    furniture.push({
      type: furnitureTypes[Math.floor(Math.random() * furnitureTypes.length)],
      x: 50 + Math.random() * 300,
      y: 50 + Math.random() * 200,
      rotation: Math.random() * 360,
      seats: Math.random() > 0.5 ? 1 : 0,
    });
  }
  return furniture;
};

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User joins the cosmos
  socket.on('user:join', async (data) => {
    const odestined = data.odestined || uuidv4();
    const user = {
      socketId: socket.id,
      odestined,
      name: data.name,
      avatar: data.avatar || { color: '#6366f1', style: 'default' },
      position: {
        x: 300 + Math.random() * 200,
        y: 300 + Math.random() * 200,
      },
      direction: 'down',
      isSitting: false,
      sittingOn: null,
      currentRoom: null,
    };

    users.set(socket.id, user);
    blockedUsers.set(odestined, new Set());
    unreadMessages.set(odestined, {});

    // Send confirmation to joining user
    socket.emit('user:joined', {
      ...user,
      rooms: await getAllRooms(),
      backgroundTypes: ROOM_BACKGROUNDS,
    });

    // Send existing users to new user
    const existingUsers = [];
    users.forEach((u, sid) => {
      if (sid !== socket.id) {
        existingUsers.push(u);
      }
    });
    socket.emit('users:existing', existingUsers);

    // Broadcast new user to others
    socket.broadcast.emit('user:new', user);

    // Send global chat history
    sendChatHistory('global', [socket.id]);
  });

  // User moves
  socket.on('user:move', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    user.position = data.position;
    user.direction = data.direction;
    user.isSitting = false;
    user.sittingOn = null;

    // Broadcast movement
    socket.broadcast.emit('user:moved', {
      odestined: user.odestined,
      position: user.position,
      direction: user.direction,
      isSitting: false,
    });

    // Check proximity with all other users
    users.forEach((otherUser, otherSocketId) => {
      if (otherSocketId !== socket.id) {
        checkProximity(user, otherUser);
      }
    });
  });

  // User sits on furniture
  socket.on('user:sit', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    user.isSitting = true;
    user.sittingOn = data.furnitureId;
    user.position = data.position;

    socket.broadcast.emit('user:sat', {
      odestined: user.odestined,
      position: user.position,
      furnitureId: data.furnitureId,
      isSitting: true,
    });
  });

  // User stands up
  socket.on('user:stand', () => {
    const user = users.get(socket.id);
    if (!user) return;

    user.isSitting = false;
    user.sittingOn = null;

    socket.broadcast.emit('user:stood', {
      odestined: user.odestined,
      isSitting: false,
    });
  });

  // Chat message (proximity or room-based)
  socket.on('chat:message', async (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const message = {
      id: uuidv4(),
      roomId: data.roomId,
      senderId: user.odestined,
      senderName: user.name,
      content: data.content,
      timestamp: new Date(),
      isGlobal: data.roomId === 'global',
    };

    // Save to database
    try {
      await new Message(message).save();
    } catch (err) {
      // Continue without persistence
    }

    if (data.roomId === 'global') {
      // Global chat - send to everyone
      io.emit('chat:message', message);
      
      // Update unread counts for users not viewing global chat
      users.forEach((u, sid) => {
        if (sid !== socket.id) {
          const unread = unreadMessages.get(u.odestined) || {};
          unread.global = (unread.global || 0) + 1;
          unreadMessages.set(u.odestined, unread);
          io.to(sid).emit('chat:unread', { roomId: 'global', count: unread.global });
        }
      });
    } else if (data.roomId.startsWith('proximity:')) {
      // Proximity chat
      const pairKey = data.roomId.replace('proximity:', '');
      const connection = proximityConnections.get(pairKey);
      
      if (connection) {
        connection.userIds.forEach(odestined => {
          const targetUser = [...users.values()].find(u => u.odestined === odestined);
          if (targetUser && !isBlocked(user.odestined, odestined)) {
            io.to(targetUser.socketId).emit('chat:message', message);
          }
        });
      }
    } else if (data.roomId.startsWith('room:')) {
      // Room-specific chat
      const roomId = data.roomId;
      
      // Find all users in this room
      users.forEach((u, sid) => {
        if (u.currentRoom === roomId.replace('room:', '')) {
          io.to(sid).emit('chat:message', message);
          
          if (sid !== socket.id) {
            const unread = unreadMessages.get(u.odestined) || {};
            unread[roomId] = (unread[roomId] || 0) + 1;
            unreadMessages.set(u.odestined, unread);
            io.to(sid).emit('chat:unread', { roomId, count: unread[roomId] });
          }
        }
      });
    }
  });

  // Mark messages as read
  socket.on('chat:read', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const unread = unreadMessages.get(user.odestined) || {};
    unread[data.roomId] = 0;
    unreadMessages.set(user.odestined, unread);
  });

  // User enters a room
  socket.on('room:enter', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    user.currentRoom = data.roomId;
    socket.join(`room:${data.roomId}`);
    
    // Send room chat history
    sendChatHistory(`room:${data.roomId}`, [socket.id]);
  });

  // User leaves a room
  socket.on('room:leave', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    user.currentRoom = null;
    socket.leave(`room:${data.roomId}`);
  });

  // Create custom room
  socket.on('room:create', async (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    // Check if user already has a room
    const existingRoom = await UserRoom.findOne({ ownerId: user.odestined });
    if (existingRoom) {
      socket.emit('room:error', { message: 'You can only create one room' });
      return;
    }

    const room = {
      id: `custom:${uuidv4()}`,
      roomId: `custom:${uuidv4()}`,
      name: data.name,
      roomName: data.name,
      ownerId: user.odestined,
      ownerName: user.name,
      backgroundType: data.backgroundType || 'cosmic',
      isCustom: true,
      x: 700 + Math.random() * 200,
      y: 550 + Math.random() * 100,
      width: 400,
      height: 350,
      furniture: generateRandomFurniture(),
    };

    try {
      await new UserRoom(room).save();
    } catch (err) {
      customRooms.set(user.odestined, room);
    }

    // Broadcast new room to all users
    io.emit('room:created', room);
    socket.emit('room:create:success', room);
  });

  // Block user
  socket.on('user:block', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const blocked = blockedUsers.get(user.odestined) || new Set();
    blocked.add(data.targetUserId);
    blockedUsers.set(user.odestined, blocked);

    // Remove any existing proximity connection
    users.forEach((otherUser) => {
      if (otherUser.odestined === data.targetUserId) {
        const pairKey = createPairKey(user.odestined, otherUser.odestined);
        if (proximityConnections.has(pairKey)) {
          proximityConnections.delete(pairKey);
          io.to(user.socketId).emit('proximity:disconnect', { userId: otherUser.odestined });
          io.to(otherUser.socketId).emit('proximity:disconnect', { userId: user.odestined });
        }
      }
    });

    socket.emit('user:blocked', { userId: data.targetUserId });
  });

  // Unblock user
  socket.on('user:unblock', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const blocked = blockedUsers.get(user.odestined) || new Set();
    blocked.delete(data.targetUserId);
    blockedUsers.set(user.odestined, blocked);

    socket.emit('user:unblocked', { userId: data.targetUserId });
  });

  // Vote kick
  socket.on('vote:kick', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const targetUserId = data.targetUserId;
    const votes = voteKicks.get(targetUserId) || new Set();
    votes.add(user.odestined);
    voteKicks.set(targetUserId, votes);

    const onlineCount = users.size;
    const voteCount = votes.size;
    const threshold = Math.ceil(onlineCount * VOTE_KICK_THRESHOLD);

    // Broadcast vote update
    io.emit('vote:update', {
      targetUserId,
      voteCount,
      threshold,
      voters: [...votes],
    });

    if (voteCount >= threshold) {
      // Kick the user
      const targetUser = [...users.values()].find(u => u.odestined === targetUserId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('user:kicked', {
          reason: 'You have been removed by community vote',
        });
        
        // Force disconnect
        const targetSocket = io.sockets.sockets.get(targetUser.socketId);
        if (targetSocket) {
          targetSocket.disconnect(true);
        }
      }
      voteKicks.delete(targetUserId);
    }
  });

  // WebRTC signaling for video/voice chat
  socket.on('webrtc:offer', (data) => {
    const targetUser = [...users.values()].find(u => u.odestined === data.targetUserId);
    if (targetUser && !isBlocked(users.get(socket.id)?.odestined, targetUser.odestined)) {
      io.to(targetUser.socketId).emit('webrtc:offer', {
        offer: data.offer,
        fromUserId: users.get(socket.id)?.odestined,
        fromUserName: users.get(socket.id)?.name,
        type: data.type, // 'video' or 'voice'
      });
    }
  });

  socket.on('webrtc:answer', (data) => {
    const targetUser = [...users.values()].find(u => u.odestined === data.targetUserId);
    if (targetUser) {
      io.to(targetUser.socketId).emit('webrtc:answer', {
        answer: data.answer,
        fromUserId: users.get(socket.id)?.odestined,
      });
    }
  });

  socket.on('webrtc:ice-candidate', (data) => {
    const targetUser = [...users.values()].find(u => u.odestined === data.targetUserId);
    if (targetUser) {
      io.to(targetUser.socketId).emit('webrtc:ice-candidate', {
        candidate: data.candidate,
        fromUserId: users.get(socket.id)?.odestined,
      });
    }
  });

  socket.on('webrtc:end', (data) => {
    const targetUser = [...users.values()].find(u => u.odestined === data.targetUserId);
    if (targetUser) {
      io.to(targetUser.socketId).emit('webrtc:end', {
        fromUserId: users.get(socket.id)?.odestined,
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      // Clean up proximity connections
      proximityConnections.forEach((connection, pairKey) => {
        if (connection.userIds.includes(user.odestined)) {
          const otherUserId = connection.userIds.find(id => id !== user.odestined);
          const otherUser = [...users.values()].find(u => u.odestined === otherUserId);
          if (otherUser) {
            io.to(otherUser.socketId).emit('proximity:disconnect', { userId: user.odestined });
          }
          proximityConnections.delete(pairKey);
        }
      });

      // Clear vote kicks for this user
      voteKicks.forEach((votes, targetId) => {
        votes.delete(user.odestined);
      });

      users.delete(socket.id);
      io.emit('user:left', { odestined: user.odestined });
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
