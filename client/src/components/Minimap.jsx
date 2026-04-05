import React from 'react';
import { useCosmosStore } from '../store';

const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 1500;
const MINIMAP_WIDTH = 150;
const MINIMAP_HEIGHT = (CANVAS_HEIGHT / CANVAS_WIDTH) * MINIMAP_WIDTH;
const SCALE = MINIMAP_WIDTH / CANVAS_WIDTH;

const Minimap = () => {
  const { user, users, rooms } = useCosmosStore();

  if (!user) return null;

  return (
    <div className="absolute bottom-4 right-4 z-20">
      <div 
        className="glass rounded-xl overflow-hidden shadow-lg"
        style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
      >
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cosmos-bg"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${10 * SCALE}px ${10 * SCALE}px`,
          }}
        />

        {/* Rooms */}
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`absolute rounded-sm room-bg-${room.backgroundType || 'cosmic'} opacity-70`}
            style={{
              left: room.x * SCALE,
              top: room.y * SCALE,
              width: room.width * SCALE,
              height: room.height * SCALE,
            }}
          />
        ))}

        {/* Other Users */}
        {users.map((otherUser) => (
          <div
            key={otherUser.odestined}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: (otherUser.position?.x || 0) * SCALE - 3,
              top: (otherUser.position?.y || 0) * SCALE - 3,
              backgroundColor: otherUser.avatar?.color || '#6366f1',
            }}
            title={otherUser.name}
          />
        ))}

        {/* Current User */}
        <div
          className="absolute w-2.5 h-2.5 rounded-full ring-2 ring-white"
          style={{
            left: (user.position?.x || 0) * SCALE - 5,
            top: (user.position?.y || 0) * SCALE - 5,
            backgroundColor: user.avatar?.color || '#6366f1',
          }}
        />

        {/* Label */}
        <div className="absolute bottom-1 left-1 text-[8px] text-gray-400 font-medium">
          MAP
        </div>
      </div>
    </div>
  );
};

export default Minimap;
