# Virtual Cosmos - 3D Avatar Edition

A virtual space where users can meet, chat, and video call with beautiful 3D character avatars.

## What's New in This Version

### 3D Character Avatars
- **12 unique characters** from Kenney's Mini Characters pack (6 male, 6 female)
- Characters are tinted with your chosen color
- Avatars rotate based on movement direction
- Subtle bobbing animation adds life to characters

### Redesigned Lobby
- Interactive 3D avatar preview with auto-rotation
- Character selection grid with gender filters
- 12 vibrant color options with glow effects
- Smooth Framer Motion animations

### Enhanced In-Game Experience
- 3D avatars in the game canvas
- Glowing proximity ring for your character
- 3D avatar previews in user list
- Rotating 3D preview in user context menu

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Client Setup
```bash
cd client
npm install
npm run dev
```

### Server Setup
```bash
cd server
npm install
npm start
```

The client runs on `http://localhost:5173` by default.
The server runs on `http://localhost:3001` by default.

## Project Structure

```
├── client/
│   ├── public/
│   │   └── models/           # 3D character GLB files
│   ├── src/
│   │   ├── components/
│   │   │   ├── Avatar3D.jsx      # 3D avatar components
│   │   │   ├── LobbyScreen.jsx   # Redesigned lobby
│   │   │   ├── CosmosCanvas.jsx  # Main game canvas
│   │   │   └── ...
│   │   ├── hooks/
│   │   ├── store.js
│   │   └── App.jsx
│   └── package.json
│
└── server/
    ├── index.js
    └── package.json
```

## Technologies Used

### Client
- React 18
- Three.js + React Three Fiber + Drei
- Framer Motion
- Tailwind CSS
- Zustand (state management)
- Socket.IO Client

### Server
- Node.js
- Express
- Socket.IO

## Character Models

Models are from [Kenney's Mini Characters](https://kenney.nl/assets/mini-characters) pack:
- `character-male-a.glb` through `character-male-f.glb`
- `character-female-a.glb` through `character-female-f.glb`

## Controls

- **Arrow Keys / WASD** - Move your character
- **Click** - Walk to location
- **Click on user** - Open interaction menu (voice/video call, block, vote kick)

## Features

- Real-time multiplayer movement
- Global and room-based chat
- Voice and video calls (WebRTC)
- Multiple themed rooms
- Custom room creation
- User blocking and vote-to-kick
- Minimap navigation

## License

Character models: [Kenney License (CC0)](https://kenney.nl/assets/mini-characters)
