# 🌌 Virtual Cosmos v2.0

A feature-rich 2D virtual environment where users can move around, interact with each other in real-time through proximity-based chat, video/voice calls, and customizable rooms.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-blue)
![PixiJS](https://img.shields.io/badge/Rendering-PixiJS-orange)
![WebRTC](https://img.shields.io/badge/Calls-WebRTC-red)

## ✨ Features

### Core Features
- **2D Virtual Space** — PixiJS-rendered world with rooms, zones, and grid floor
- **Real-Time Multiplayer** — See other users move in real time via WebSockets
- **Proximity Detection** — Automatic chat connection when users are within 150px radius
- **Smooth Movement** — WASD / Arrow key controls with diagonal normalization

### 🎨 Cute 3D Doll Avatars
- **5 Avatar Styles**: Round, Square, Cat, Robot, Alien
- **15 Color Options** for customization
- **Directional Facing**: Avatars face the direction they're moving
- **Smooth Animations**: Bouncing, floating effects

### 🪑 Interactive Furniture
- **Sit/Stand Feature**: Press `E` near furniture to sit
- **Multiple Furniture Types**: 
  - Chairs, Sofas, Stools (sittable)
  - Tables, Desks, Café tables
  - Plants, Lamps, Whiteboards, Counters
- **3 Default Rooms**: Lounge, Meeting Room, Cosmic Café

### 💬 Enhanced Chat System
- **Proximity Chat**: Opens automatically when near another user
- **Room-Based Chat**: Each room has its own chat
- **Global Chat**: Common group chat for all users
- **Distinct Chat Colors**: Blue/Cyan theme for chat panels vs Purple theme for main UI
- **Unread Notifications**: Badge showing number of unread messages
- **Persistent History**: Messages stored in MongoDB

### 🚫 User Management
- **Block/Unblock Users**: Prevents chat and proximity connections
- **Vote Kick System**: Remove users by majority vote (50% threshold)
- **User List Panel**: See all online users with status

### 📹 Video & Voice Calls
- **Video Calls**: Camera-based calls with toggle controls
- **Voice Calls**: Audio-only calls
- **Call Controls**: Mute, video on/off, end call
- **Minimize Mode**: Keep call visible while navigating

### 🏠 Custom Rooms
- **Create Your Room**: One room per user
- **8 Background Themes**: Cozy, Professional, Warm, Cosmic, Nature, Minimal, Retro, Neon
- **Auto-Generated Furniture**: Random furniture placement

### 🗺️ Additional Features
- **Minimap**: Bird's-eye view of user positions
- **Sitting Animation**: Avatars visually sit on furniture
- **Connection Lines**: Visual proximity indicators

## 🛠 Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, Vite, PixiJS 7, Tailwind CSS  |
| Backend  | Node.js, Express, Socket.IO 4           |
| Database | MongoDB (Mongoose)                      |
| Realtime | Socket.IO, WebRTC                       |
| Styling  | Tailwind CSS, Framer Motion             |
| Fonts    | Outfit, IBM Plex Sans, JetBrains Mono   |

## 📁 Project Structure

```
virtual-cosmos/
├── server/
│   ├── index.js          # Express + Socket.IO server with all events
│   ├── .env              # Environment variables
│   └── package.json
├── client/
│   ├── public/
│   │   └── cosmos.svg    # Favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── LobbyScreen.jsx     # Join screen with avatar customization
│   │   │   ├── CosmosCanvas.jsx    # PixiJS game canvas with furniture
│   │   │   ├── ChatPanel.jsx       # Proximity chat UI (blue theme)
│   │   │   ├── GlobalChat.jsx      # Global chat with vote kick
│   │   │   ├── StatusBar.jsx       # Top navigation with notifications
│   │   │   ├── UserList.jsx        # Online users with block/unblock
│   │   │   ├── VideoCallOverlay.jsx # Video/Voice call UI
│   │   │   ├── CreateRoomModal.jsx # Custom room creation
│   │   │   └── Minimap.jsx         # Position overview
│   │   ├── hooks/
│   │   │   ├── useSocket.js        # Socket.IO connection hook
│   │   │   └── useWebRTC.js        # WebRTC for video/voice
│   │   ├── store.js                # Zustand state management
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **MongoDB** running locally on port 27017 (or update `.env`)
- **npm** or **yarn**

### 1. Clone or Extract the Project

```bash
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

The `server/.env` file is pre-configured:

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

> **Note:** The app works without MongoDB — it will log a warning and run with in-memory state only.

### 5. Run the Application

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

## 🎮 Controls & Usage

### Movement
- **W / ↑** — Move up
- **S / ↓** — Move down
- **A / ←** — Move left
- **D / →** — Move right

### Interactions
- **E** — Sit on nearby furniture / Stand up

### Features
1. **Enter your name** and customize your avatar on the lobby screen
2. **Move around** using WASD or Arrow Keys
3. **Walk near another user** to open proximity chat
4. **Click "Global Chat"** to open the common group chat
5. **Use video/voice buttons** in chat panel to call nearby users
6. **Click "Create Room"** to make your own customized room
7. **Block users** from the user list to prevent interaction
8. **Vote to kick** troublesome users from global chat

## 🔧 Socket Events

### User Events
| Event               | Direction       | Description                    |
|---------------------|-----------------|--------------------------------|
| `user:join`         | Client → Server | User enters the cosmos         |
| `user:joined`       | Server → Client | Confirms join with spawn data  |
| `users:existing`    | Server → Client | List of currently online users |
| `user:new`          | Server → Client | Broadcast: new user arrived    |
| `user:move`         | Client → Server | Position update                |
| `user:moved`        | Server → Client | Broadcast: user moved          |
| `user:sit`          | Client → Server | User sits on furniture         |
| `user:stand`        | Client → Server | User stands up                 |
| `user:left`         | Server → Client | Broadcast: user disconnected   |
| `user:block`        | Client → Server | Block a user                   |
| `user:unblock`      | Client → Server | Unblock a user                 |

### Proximity & Chat
| Event                  | Direction       | Description                 |
|------------------------|-----------------|------------------------------|
| `proximity:connect`    | Server → Client | Two users entered proximity  |
| `proximity:disconnect` | Server → Client | Two users left proximity     |
| `chat:message`         | Bidirectional   | Send/receive chat messages   |
| `chat:history`         | Server → Client | Previous messages for a room |
| `chat:unread`          | Server → Client | Unread message count         |

### Rooms
| Event            | Direction       | Description              |
|------------------|-----------------|--------------------------|
| `room:create`    | Client → Server | Create custom room       |
| `room:created`   | Server → Client | Broadcast: new room      |
| `room:enter`     | Client → Server | Enter a room             |
| `room:leave`     | Client → Server | Leave a room             |

### Video/Voice (WebRTC)
| Event                 | Direction       | Description           |
|-----------------------|-----------------|-----------------------|
| `webrtc:offer`        | Bidirectional   | WebRTC offer          |
| `webrtc:answer`       | Bidirectional   | WebRTC answer         |
| `webrtc:ice-candidate`| Bidirectional   | ICE candidate         |
| `webrtc:end`          | Bidirectional   | End call              |

### Vote Kick
| Event         | Direction       | Description              |
|---------------|-----------------|--------------------------|
| `vote:kick`   | Client → Server | Vote to kick a user      |
| `vote:update` | Server → Client | Vote count update        |
| `user:kicked` | Server → Client | User was kicked          |

## 🎨 Design Features

### Chat Color Differentiation
- **Main UI**: Purple/Violet theme (`#8b5cf6`)
- **Proximity Chat**: Blue/Cyan theme (`#38bdf8`)
- Clear visual distinction between global UI and chat panels

### Avatar Styles
- **Round**: Classic friendly look with big eyes
- **Square**: Block-style character
- **Cat**: With ears, whiskers, and nose
- **Robot**: Metallic with antenna and LED eyes
- **Alien**: Large eyes with green pupils

### Room Themes
Each room has a unique gradient background:
- **Cozy**: Purple tones
- **Professional**: Blue corporate
- **Warm**: Orange/Red café vibes
- **Cosmic**: Deep space purple
- **Nature**: Forest green
- **Minimal**: Clean grayscale
- **Retro**: Amber vintage
- **Neon**: Pink/Cyan electric

## 📝 License

MIT
