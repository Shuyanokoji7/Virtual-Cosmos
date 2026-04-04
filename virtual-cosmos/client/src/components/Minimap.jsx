import React from 'react';
import { motion } from 'framer-motion';
import { useCosmosStore } from '../store';

const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1200;
const MINIMAP_WIDTH = 180;
const MINIMAP_HEIGHT = 135;

const Minimap = () => {
  const { user, users, rooms } = useCosmosStore();

  const scaleX = MINIMAP_WIDTH / WORLD_WIDTH;
  const scaleY = MINIMAP_HEIGHT / WORLD_HEIGHT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-4 left-4 glass rounded-xl overflow-hidden z-30"
    >
      {/* Header */}
      <div className="px-3 py-2 bg-purple-900/30 border-b border-purple-500/20">
        <span className="text-xs font-medium text-purple-300">Minimap</span>
      </div>

      {/* Map Area */}
      <div
        className="relative bg-cosmos-bg/80"
        style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
      >
        {/* Grid lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.2 }}
        >
          <defs>
            <pattern
              id="minimap-grid"
              width={10}
              height={10}
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="#6366f1"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#minimap-grid)" />
        </svg>

        {/* Rooms */}
        {rooms.map((room) => (
          <div
            key={room.id}
            className="absolute rounded-sm border border-purple-500/30"
            style={{
              left: room.x * scaleX,
              top: room.y * scaleY,
              width: room.width * scaleX,
              height: room.height * scaleY,
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
            }}
          />
        ))}

        {/* Other Users */}
        {users.map((u) => (
          <motion.div
            key={u.odestined}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: u.avatar?.color || '#6366f1',
              left: (u.position?.x || 0) * scaleX - 4,
              top: (u.position?.y || 0) * scaleY - 4,
              boxShadow: `0 0 4px ${u.avatar?.color || '#6366f1'}`,
            }}
            animate={{
              left: (u.position?.x || 0) * scaleX - 4,
              top: (u.position?.y || 0) * scaleY - 4,
            }}
            transition={{ duration: 0.1 }}
          />
        ))}

        {/* Current User */}
        {user?.position && (
          <motion.div
            className="absolute w-3 h-3 rounded-full border-2 border-white"
            style={{
              backgroundColor: user.avatar?.color || '#6366f1',
              boxShadow: `0 0 8px ${user.avatar?.color || '#6366f1'}`,
            }}
            animate={{
              left: user.position.x * scaleX - 6,
              top: user.position.y * scaleY - 6,
            }}
            transition={{ duration: 0.1 }}
          />
        )}

        {/* Player view area indicator */}
        {user?.position && (
          <div
            className="absolute border border-white/30 rounded-sm pointer-events-none"
            style={{
              left: Math.max(0, user.position.x * scaleX - 30),
              top: Math.max(0, user.position.y * scaleY - 22),
              width: 60,
              height: 45,
            }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="px-3 py-2 flex items-center gap-3 text-xs text-gray-400 border-t border-purple-500/20">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-500 border border-white" />
          <span>You</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>Others</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Minimap;
