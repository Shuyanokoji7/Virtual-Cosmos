# 🌌 Virtual Cosmos

A 2D virtual environment where users can move around and interact with each other in real time through proximity-based chat.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-blue)
![PixiJS](https://img.shields.io/badge/Rendering-PixiJS-orange)

## ✨ Features

- **2D Virtual Space** — PixiJS-rendered world with rooms, zones, and grid floor
- **Real-Time Multiplayer** — See other users move in real time via WebSockets
- **Proximity Detection** — Automatic connection when users are within 150px radius
- **Chat System** — Chat panel appears/disappears based on proximity
- **Smooth Movement** — WASD / Arrow key controls with diagonal normalization
- **Minimap** — Bird's-eye view of user positions
- **Persistent Chat** — MongoDB stores message history per room
- **Polished UI** — Custom avatars, animations, glassmorphism panels

## 🛠 Tech Stack

| Layer    | Technology                     |
|----------|--------------------------------|
| Frontend | React 18, Vite, PixiJS 7, Tailwind CSS |
| Backend  | Node.js, Express, Socket.IO 4 |
| Database | MongoDB (Mongoose)             |
| Fonts    | Outfit, IBM Plex Sans, JetBrains Mono |

## 📁 Project Structure

```
virtual-cosmos/
├── server/
│   ├── index.js          # Express + Socket.IO server
│   ├── .env              # Environment variables
│   └── package.json
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LobbyScreen.jsx    # Join screen with name input
│   │   │   ├── CosmosCanvas.jsx   # PixiJS game canvas
│   │   │   ├── ChatPanel.jsx      # Proximity chat UI
│   │   │   ├── StatusBar.jsx      # Top navigation bar
│   │   │   └── UserList.jsx       # Online users panel
│   │   ├── hooks/
│   │   │   └── useSocket.js       # Socket.IO hook
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **MongoDB** running locally on port 27017 (or update `.env`)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/virtual-cosmos.git
cd virtual-cosmos
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment

Edit `server/.env` if needed:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/virtual-cosmos
CLIENT_URL=http://localhost:5173
PROXIMITY_RADIUS=150
```

### 4. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or with Docker
docker run -d -p 27017:27017 --name cosmos-mongo mongo:7
```

> **Note:** The app works without MongoDB too — it will log a warning and run with in-memory state only (chat history won't persist across restarts).

### 5. Run the Application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

### 6. Open in Browser

Open **multiple browser tabs** at `http://localhost:5173` to simulate multiple users.

## 🎮 How to Use

1. **Enter your name** on the lobby screen and click "Enter the Cosmos"
2. **Move around** using `W A S D` or `Arrow Keys`
3. **Walk near another user** (within the purple proximity circle)
4. **Chat panel appears** automatically — send messages!
5. **Walk away** and the chat panel disappears

## 🔧 Architecture

### Backend (Socket.IO Events)

| Event               | Direction       | Description                    |
|---------------------|-----------------|--------------------------------|
| `user:join`         | Client → Server | User enters the cosmos         |
| `user:joined`       | Server → Client | Confirms join with spawn data  |
| `users:existing`    | Server → Client | List of currently online users |
| `user:new`          | Server → Client | Broadcast: new user arrived    |
| `user:move`         | Client → Server | Position update                |
| `user:moved`        | Server → Client | Broadcast: user moved          |
| `user:left`         | Server → Client | Broadcast: user disconnected   |
| `proximity:connect` | Server → Client | Two users entered proximity    |
| `proximity:disconnect` | Server → Client | Two users left proximity    |
| `chat:message`      | Bidirectional   | Send/receive chat messages     |
| `chat:history`      | Server → Client | Previous messages for a room   |

### Proximity Algorithm

```
distance = sqrt((x1 - x2)² + (y1 - y2)²)

if distance < PROXIMITY_RADIUS → connect (join chat room)
if distance ≥ PROXIMITY_RADIUS → disconnect (leave chat room)
```

Checked on every position update. Uses a sorted pair key to avoid duplicate connections.

## 🎨 Design Decisions

- **PixiJS over plain Canvas** — Hardware-accelerated rendering, better performance with many sprites
- **Socket.IO over raw WebSocket** — Built-in rooms, reconnection, and fallback to polling
- **In-memory + MongoDB hybrid** — Fast real-time state in memory, persistence in DB
- **Camera follow** — Smooth viewport tracking centered on the player
- **Position throttling** — Sends updates every 2 frames to reduce network traffic

## 🌟 Bonus Features

- Minimap showing all user positions
- Zone/room decorations (Lounge, Meeting Room, Cafe, etc.)
- Smooth avatar interpolation for other users
- Chat message history persisted in MongoDB
- Glassmorphism UI with custom scrollbars
- Responsive proximity ring visualization
- Connection lines between nearby users

## 📝 License

MIT
