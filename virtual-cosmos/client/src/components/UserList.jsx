import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, ChevronUp, Ban, UserCheck, Phone, Video, MapPin } from 'lucide-react';
import { useCosmosStore } from '../store';
import { useWebRTC } from '../hooks/useWebRTC';

const UserList = ({ emit, socket }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { users, user, blockedUsers, proximityUsers } = useCosmosStore();
  const { startCall } = useWebRTC(socket);

  const handleBlock = (userId) => {
    emit('user:block', { targetUserId: userId });
  };

  const handleUnblock = (userId) => {
    emit('user:unblock', { targetUserId: userId });
  };

  const isBlocked = (userId) => blockedUsers.has(userId);
  const isNearby = (userId) => proximityUsers.some((p) => p.odestined === userId);

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="fixed right-4 top-20 w-72 glass rounded-2xl overflow-hidden z-30"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-purple-900/30 hover:bg-purple-900/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          <span className="font-display font-semibold text-white">
            Online Users
          </span>
          <span className="px-2 py-0.5 bg-purple-500/30 rounded-full text-xs text-purple-300">
            {users.length + 1}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* User List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-h-96 overflow-y-auto"
          >
            {/* Current User */}
            <div className="px-4 py-3 flex items-center gap-3 border-b border-purple-500/20 bg-purple-500/10">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                style={{ backgroundColor: user?.avatar?.color || '#6366f1' }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white flex items-center gap-2">
                  {user?.name}
                  <span className="text-xs text-purple-400">(you)</span>
                </p>
                <p className="text-xs text-gray-400">
                  {Math.round(user?.position?.x || 0)}, {Math.round(user?.position?.y || 0)}
                </p>
              </div>
            </div>

            {/* Other Users */}
            {users.map((u) => {
              const blocked = isBlocked(u.odestined);
              const nearby = isNearby(u.odestined);

              return (
                <motion.div
                  key={u.odestined}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`px-4 py-3 flex items-center gap-3 border-b border-purple-500/10 hover:bg-purple-500/10 transition-colors ${
                    blocked ? 'opacity-50' : ''
                  }`}
                >
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                      style={{ backgroundColor: u.avatar?.color || '#6366f1' }}
                    >
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    {nearby && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-cosmos-surface flex items-center justify-center">
                        <MapPin className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate flex items-center gap-2">
                      {u.name}
                      {nearby && (
                        <span className="text-xs text-green-400">nearby</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {u.isSitting ? '💺 Sitting' : `📍 ${Math.round(u.position?.x || 0)}, ${Math.round(u.position?.y || 0)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {!blocked && nearby && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => startCall(u.odestined, 'voice')}
                          className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                          title="Voice Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => startCall(u.odestined, 'video')}
                          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          title="Video Call"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </motion.button>
                      </>
                    )}
                    {blocked ? (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleUnblock(u.odestined)}
                        className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                        title="Unblock"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleBlock(u.odestined)}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        title="Block"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {users.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No other users online</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserList;
