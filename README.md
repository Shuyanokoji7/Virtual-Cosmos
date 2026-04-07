<div align="center">

# 🌌 Virtual Cosmos — 3D Avatar Edition

**A real-time virtual space where users meet, chat, and video call with stunning 3D character avatars.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Virtual_Cosmos-blueviolet?style=for-the-badge)](https://virtual-cosmos-teal.vercel.app/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Rendering-000000?style=flat-square&logo=three.js)](https://threejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Live Deployment](#-live-deployment)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development-localhost)
  - [Environment Variables](#environment-variables)
- [Running Fully on Localhost](#️-running-fully-on-localhost-no-cloud-required)
- [Deployment (Production)](#️-deployment-production)
- [Controls & Gameplay](#-controls--gameplay)
- [Character Models](#-character-models)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔭 Overview

**Virtual Cosmos** is a multiplayer 2D/3D virtual world built with React, Three.js, and Socket.IO. Users join a shared cosmos, pick a 3D avatar, explore themed rooms, and interact with other users in real time through proximity-based chat, voice calls, and video calls — all from the browser.

The project follows a **client-server architecture**: the React frontend handles rendering, avatar animations, and user interactions, while the Node.js/Express backend manages real-time communication, room state, user presence, and persistent chat history via MongoDB.

---

## 🌐 Live Deployment

The application is deployed and accessible online:

| Layer    | Platform | URL |
|----------|----------|-----|
| Frontend | **Vercel** | [https://virtual-cosmos-teal.vercel.app/](https://virtual-cosmos-teal.vercel.app/) |
| Backend  | **Render** | Hosted as a web service on Render |

> Simply visit the Vercel URL above to jump into the cosmos — no installation required!

The app also works perfectly on **localhost** for development. See the [Getting Started](#-getting-started) section below.

---

## ✨ Features

### 🎭 3D Character Avatars
- **12 unique characters** from Kenney's Mini Characters pack (6 male, 6 female)
- Characters are tinted with your chosen avatar color
- Avatars rotate based on movement direction
- Subtle bobbing animation that brings characters to life

### 🏠 Interactive Lobby
- 3D avatar preview with auto-rotation
- Character selection grid with male/female gender filters
- 12 vibrant color options with glowing selection effects
- Smooth entrance animations powered by Framer Motion

### 🗺️ Themed Rooms & Custom Spaces
- **The Lounge** — a cozy hangout with sofas, chairs, and plants
- **Meeting Room** — professional setup with desks and a whiteboard
- **Cosmic Café** — a warm café with tables, stools, and a counter
- **Custom Rooms** — create your own rooms with 8 background themes: `cozy`, `professional`, `warm`, `cosmic`, `nature`, `minimal`, `retro`, `neon`

### 💬 Real-Time Communication
- **Proximity Chat** — automatically connects you with nearby users
- **Global Chat** — broadcast messages to everyone in the cosmos
- **Room Chat** — scoped conversations within specific rooms
- **Persistent Chat History** — messages stored in MongoDB survive server restarts

### 📞 Voice & Video Calls (WebRTC)
- Peer-to-peer voice and video calling
- Click on any nearby user to initiate a call
- Incoming call notifications with accept/decline

### 🛡️ Moderation Tools
- **User Blocking** — block disruptive users
- **Vote-to-Kick** — democratic kick system for community moderation

### 🧭 Navigation
- **Minimap** — bird's-eye overview of the cosmos with live user positions
- **Click-to-Move** — click anywhere on the canvas to walk there
- **Keyboard Controls** — WASD / Arrow Keys for direct movement

---

## 🛠️ Tech Stack

### Frontend (Client)
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Three.js** + **React Three Fiber** + **Drei** | 3D avatar rendering and scene management |
| **Framer Motion** | Smooth animations and transitions |
| **Tailwind CSS** | Utility-first styling |
| **Zustand** | Lightweight state management |
| **Socket.IO Client** | Real-time server communication |
| **Vite** | Lightning-fast dev server and build tool |

### Backend (Server)
| Technology | Purpose |
|---|---|
| **Node.js** + **Express** | HTTP server and API |
| **Socket.IO** | WebSocket-based real-time events |
| **MongoDB** + **Mongoose** | Persistent storage for messages and custom rooms |
| **WebRTC** (signaling via Socket.IO) | Peer-to-peer voice and video |
| **dotenv** | Environment variable management |

---

## 📂 Project Structure

```
Virtual-Cosmos/
├── client/                         # React frontend (Vite)
│   ├── public/
│   │   ├── models/                 # 3D character GLB files
│   │   └── cosmos.svg              # Logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx             # Root app component
│   │   │   ├── Avatar3D.jsx        # 3D avatar rendering (Three.js)
│   │   │   ├── LobbyScreen.jsx     # Lobby with character/color selection
│   │   │   ├── CosmosCanvas.jsx    # Main game canvas
│   │   │   ├── ChatPanel.jsx       # Proximity/room chat panel
│   │   │   ├── GlobalChat.jsx      # Global chat overlay
│   │   │   ├── UserList.jsx        # Online users sidebar
│   │   │   ├── VideoCallOverlay.jsx# WebRTC call UI
│   │   │   ├── StatusBar.jsx       # Top status bar
│   │   │   ├── Minimap.jsx         # Minimap navigation
│   │   │   └── CreateRoomModal.jsx # Custom room creation
│   │   ├── hooks/
│   │   │   ├── useSocket.js        # Socket.IO connection hook
│   │   │   └── useWebRTC.js        # WebRTC peer connection hook
│   │   ├── store.js                # Zustand global state
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Global styles (Tailwind)
│   ├── vite.config.js              # Vite config with proxy
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                         # Node.js backend
│   ├── index.js                    # Express + Socket.IO server (650 lines)
│   └── package.json
│
├── package.json                    # Root scripts (concurrently)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (optional) — for persistent chat history. The server runs in **memory-only mode** if MongoDB is unavailable.

### Local Development (Localhost)

**1. Clone the repository**

```bash
git clone https://github.com/your-username/Virtual-Cosmos.git
cd Virtual-Cosmos
```

**2. Install all dependencies**

```bash
# Install root + client + server dependencies in one go
npm run install:all
```

Or install individually:

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

**3. Configure environment variables**

Create a `.env` file inside the `server/` directory:

```bash
# server/.env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/virtual-cosmos   # Optional — omit for memory-only mode
```

Create a `.env` file inside the `client/` directory:

```bash
# client/.env
VITE_API_URL=http://localhost:3001
```

> **Note:** For local development, the Vite dev server already proxies `/socket.io` requests to `localhost:3001` (configured in `vite.config.js`), but the `VITE_API_URL` is still needed for the direct Socket.IO client connection.

**4. Start the development servers**

From the project root (runs both client & server concurrently):

```bash
npm run dev
```

Or start them separately in two terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev        # Uses nodemon for hot-reload

# Terminal 2 — Frontend
cd client
npm run dev        # Vite dev server with HMR
```

**5. Open in browser**

| Service  | URL |
|----------|-----|
| Frontend | [http://localhost:5173](http://localhost:5173) |
| Backend  | [http://localhost:3001](http://localhost:3001) |

> 💡 **Tip:** Open multiple browser tabs to simulate multiple users and test proximity chat!

---

### Environment Variables

| Variable | Location | Description | Required |
|---|---|---|---|
| `PORT` | `server/.env` | Server port (default: `3001`) | No |
| `MONGODB_URI` | `server/.env` | MongoDB connection string | No (runs in-memory without it) |
| `VITE_API_URL` | `client/.env` | Backend URL for Socket.IO connection | **Yes** |

**Example values by environment:**

| Environment | `VITE_API_URL` | `MONGODB_URI` |
|---|---|---|
| Local | `http://localhost:3001` | `mongodb://localhost:27017/virtual-cosmos` |
| Production | `https://your-backend.onrender.com` | `mongodb+srv://user:pass@cluster.mongodb.net/virtual-cosmos` |

---

## 🖥️ Running Fully on Localhost (No Cloud Required)

You can run the **entire application on your own machine** — no Vercel, no Render, no cloud services needed. Everything stays local.

### Step 1 — Install Prerequisites

| Tool | Why You Need It | Install |
|---|---|---|
| **Node.js v18+** | Runs both client & server | [nodejs.org](https://nodejs.org/) |
| **MongoDB** *(optional)* | Persistent chat & rooms | [mongodb.com/try/download](https://www.mongodb.com/try/download/community) |

> **Don't want to install MongoDB?** That's fine — skip it entirely. The server automatically falls back to **in-memory mode** (chat history won't survive a restart, but everything else works perfectly).

### Step 2 — Clone & Install

```bash
git clone https://github.com/your-username/Virtual-Cosmos.git
cd Virtual-Cosmos
npm run install:all
```

### Step 3 — Create Environment Files

**`server/.env`**
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/virtual-cosmos
```
> Omit the `MONGODB_URI` line entirely if you don't have MongoDB installed — the server will run in memory-only mode.

**`client/.env`**
```env
VITE_API_URL=http://localhost:3001
```

### Step 4 — Start MongoDB *(skip if not using it)*

Open a **separate terminal** and run:

```bash
# macOS / Linux
mongod

# Windows (default install path)
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

> Alternatively, if you installed MongoDB as a system service, it may already be running in the background.

### Step 5 — Start the App

**Option A — Single command (recommended)**

```bash
npm run dev
```

This uses `concurrently` to launch both servers at once.

**Option B — Two separate terminals**

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

### Step 6 — Open & Play

| What | URL |
|---|---|
| **Open the app** | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | [http://localhost:3001](http://localhost:3001) |

> 💡 **Test multiplayer locally:** Open `http://localhost:5173` in **2–3 different browser tabs** (or use one normal + one incognito window). Each tab acts as a separate user — you'll see them appear in the cosmos and can test proximity chat, voice calls, and video calls between them.

### What Works Without Any Cloud Services

| Feature | Works Locally? | Notes |
|---|---|---|
| 3D Avatars & Movement | ✅ Yes | Fully client-side |
| Proximity Chat | ✅ Yes | Via local Socket.IO |
| Global & Room Chat | ✅ Yes | In-memory or MongoDB |
| Voice & Video Calls | ✅ Yes | WebRTC is peer-to-peer (browser ↔ browser) |
| Custom Room Creation | ✅ Yes | Stored in-memory or MongoDB |
| Chat History (persistent) | ⚠️ Needs MongoDB | Without MongoDB, history resets on server restart |
| Multiple Users | ✅ Yes | Use multiple browser tabs |

### Stopping the App

Press `Ctrl + C` in the terminal(s) where the servers are running.

---

## ☁️ Deployment (Production)

This project is also deployed online with a split architecture:

### Frontend → Vercel

1. Import the repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `client`.
3. Set the **Build Command** to `npm run build` and **Output Directory** to `dist`.
4. Add the environment variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
5. Deploy!

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Set the **Root Directory** to `server`.
3. Set the **Build Command** to `npm install` and **Start Command** to `npm start`.
4. Add environment variables:
   ```
   PORT=3001
   MONGODB_URI=mongodb+srv://...your-atlas-uri...
   ```
5. Deploy! The server will be available at `https://your-service.onrender.com`.

> **Important:** Ensure the Render backend URL is added to the `allowedOrigins` array in `server/index.js` for CORS to work correctly.

---

## 🎮 Controls & Gameplay

| Input | Action |
|---|---|
| `W` / `↑` | Move up |
| `A` / `←` | Move left |
| `S` / `↓` | Move down |
| `D` / `→` | Move right |
| **Click on canvas** | Walk to that location |
| **Click on a user** | Open interaction menu (voice/video call, block, vote kick) |

### Gameplay Loop

1. **Enter the Lobby** — choose your name, pick a character model, and select a color.
2. **Explore the Cosmos** — walk around themed rooms or create your own.
3. **Meet Others** — get close to someone to trigger proximity chat.
4. **Communicate** — chat via text, or start a voice/video call.
5. **Moderate** — block trolls or vote-kick disruptive users.

---

## 🎨 Character Models

All 3D models are from [Kenney's Mini Characters](https://kenney.nl/assets/mini-characters) pack (CC0 License):

| Male Characters | Female Characters |
|---|---|
| `character-male-a.glb` | `character-female-a.glb` |
| `character-male-b.glb` | `character-female-b.glb` |
| `character-male-c.glb` | `character-female-c.glb` |
| `character-male-d.glb` | `character-female-d.glb` |
| `character-male-e.glb` | `character-female-e.glb` |
| `character-male-f.glb` | `character-female-f.glb` |

Additional accessibility models are also included (wheelchairs, hearing aids, canes, glasses, masks).

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**.

Character models: [Kenney License (CC0)](https://kenney.nl/assets/mini-characters) — free to use with no attribution required.

---

<div align="center">

**🌌 [Enter the Cosmos →](https://virtual-cosmos-teal.vercel.app/)**

Made with ❤️ using React, Three.js, and Socket.IO

</div>
