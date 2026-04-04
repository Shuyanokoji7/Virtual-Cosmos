require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// ─── Config ───────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/virtual-cosmos";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const PROXIMITY_RADIUS = parseInt(process.env.PROXIMITY_RADIUS) || 150;

// ─── MongoDB Models ───────────────────────────────────────
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("⚠️  MongoDB not available, running without persistence:", err.message));

const userSchema = new mongoose.Schema({
  odublin: { type: String, unique: true },
  username: String,
  avatarColor: String,
  lastPosition: { x: Number, y: Number },
  lastSeen: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  roomId: String,
  senderId: String,
  senderName: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);

// ─── Express Setup ────────────────────────────────────────
const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

const server = http.createServer(app);

// ─── Socket.IO Setup ─────────────────────────────────────
const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ["GET", "POST"] },
});

// ─── In-Memory State ─────────────────────────────────────
const users = new Map();       // socketId -> { userId, username, x, y, avatarColor }
const connections = new Map(); // sorted pair key -> { user1, user2, roomId }

// ─── Helpers ─────────────────────────────────────────────
function getDistance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function pairKey(id1, id2) {
  return [id1, id2].sort().join("::");
}

function generateRoomId(id1, id2) {
  return `room_${pairKey(id1, id2)}`;
}

// Avatar colors pool
const AVATAR_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
  "#F8C471", "#82E0AA", "#F1948A", "#AED6F1", "#D7BDE2",
];

function getRandomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function getRandomSpawn() {
  return {
    x: 200 + Math.random() * 800,
    y: 200 + Math.random() * 400,
  };
}

// ─── Proximity Check ─────────────────────────────────────
function checkProximity(socket) {
  const currentUser = users.get(socket.id);
  if (!currentUser) return;

  for (const [otherSocketId, otherUser] of users) {
    if (otherSocketId === socket.id) continue;

    const dist = getDistance(currentUser, otherUser);
    const key = pairKey(socket.id, otherSocketId);
    const existing = connections.get(key);

    if (dist < PROXIMITY_RADIUS && !existing) {
      // Connect
      const roomId = generateRoomId(socket.id, otherSocketId);
      connections.set(key, {
        user1: socket.id,
        user2: otherSocketId,
        roomId,
      });

      const s1 = io.sockets.sockets.get(socket.id);
      const s2 = io.sockets.sockets.get(otherSocketId);
      if (s1) s1.join(roomId);
      if (s2) s2.join(roomId);

      // Notify both users
      io.to(socket.id).emit("proximity:connect", {
        peerId: otherSocketId,
        peerName: otherUser.username,
        peerColor: otherUser.avatarColor,
        roomId,
      });
      io.to(otherSocketId).emit("proximity:connect", {
        peerId: socket.id,
        peerName: currentUser.username,
        peerColor: currentUser.avatarColor,
        roomId,
      });

      // Send recent messages for this room
      Message.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(50)
        .then((msgs) => {
          const history = msgs.reverse().map((m) => ({
            senderId: m.senderId,
            senderName: m.senderName,
            content: m.content,
            timestamp: m.timestamp,
          }));
          io.to(socket.id).emit("chat:history", { roomId, messages: history });
          io.to(otherSocketId).emit("chat:history", { roomId, messages: history });
        })
        .catch(() => {});
    } else if (dist >= PROXIMITY_RADIUS && existing) {
      // Disconnect
      const s1 = io.sockets.sockets.get(existing.user1);
      const s2 = io.sockets.sockets.get(existing.user2);
      if (s1) s1.leave(existing.roomId);
      if (s2) s2.leave(existing.roomId);

      io.to(existing.user1).emit("proximity:disconnect", {
        peerId: existing.user2,
        roomId: existing.roomId,
      });
      io.to(existing.user2).emit("proximity:disconnect", {
        peerId: existing.user1,
        roomId: existing.roomId,
      });

      connections.delete(key);
    }
  }
}

// ─── Socket Events ───────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Connected: ${socket.id}`);

  // User joins the cosmos
  socket.on("user:join", (data) => {
    const spawn = getRandomSpawn();
    const userData = {
      userId: data.userId || uuidv4(),
      username: data.username || `User_${socket.id.slice(0, 4)}`,
      avatarColor: data.avatarColor || getRandomColor(),
      x: spawn.x,
      y: spawn.y,
    };

    users.set(socket.id, userData);

    // Persist to MongoDB
    User.findOneAndUpdate(
      { odublin: userData.userId },
      {
        username: userData.username,
        avatarColor: userData.avatarColor,
        lastPosition: { x: userData.x, y: userData.y },
        lastSeen: new Date(),
      },
      { upsert: true }
    ).catch(() => {});

    // Send back user data
    socket.emit("user:joined", {
      socketId: socket.id,
      ...userData,
    });

    // Send existing users to the new user
    const existingUsers = [];
    for (const [sid, u] of users) {
      if (sid !== socket.id) {
        existingUsers.push({ socketId: sid, ...u });
      }
    }
    socket.emit("users:existing", existingUsers);

    // Broadcast new user to others
    socket.broadcast.emit("user:new", {
      socketId: socket.id,
      ...userData,
    });

    console.log(`👤 ${userData.username} joined the cosmos`);
  });

  // User moves
  socket.on("user:move", (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    user.x = data.x;
    user.y = data.y;

    // Broadcast position
    socket.broadcast.emit("user:moved", {
      socketId: socket.id,
      x: data.x,
      y: data.y,
    });

    // Check proximity
    checkProximity(socket);
  });

  // Chat message
  socket.on("chat:message", (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const msg = {
      senderId: socket.id,
      senderName: user.username,
      content: data.content,
      timestamp: new Date(),
    };

    // Save to MongoDB
    new Message({ ...msg, roomId: data.roomId }).save().catch(() => {});

    // Broadcast to room
    io.to(data.roomId).emit("chat:message", {
      roomId: data.roomId,
      ...msg,
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (!user) return;

    // Clean up connections
    for (const [key, conn] of connections) {
      if (conn.user1 === socket.id || conn.user2 === socket.id) {
        const otherId = conn.user1 === socket.id ? conn.user2 : conn.user1;
        io.to(otherId).emit("proximity:disconnect", {
          peerId: socket.id,
          roomId: conn.roomId,
        });
        connections.delete(key);
      }
    }

    users.delete(socket.id);
    io.emit("user:left", { socketId: socket.id });
    console.log(`👋 ${user.username} left the cosmos`);
  });
});

// ─── REST Endpoints ──────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", users: users.size });
});

app.get("/api/users/online", (req, res) => {
  const online = [];
  for (const [sid, u] of users) {
    online.push({ socketId: sid, username: u.username, avatarColor: u.avatarColor });
  }
  res.json(online);
});

// ─── Start Server ────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 Virtual Cosmos server running on port ${PORT}`);
  console.log(`📡 Proximity radius: ${PROXIMITY_RADIUS}px`);
});
