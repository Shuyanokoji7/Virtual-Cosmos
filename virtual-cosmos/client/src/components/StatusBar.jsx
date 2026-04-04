import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Plus, MessageCircle, Bell, Settings, LogOut } from 'lucide-react';
import { useCosmosStore } from '../store';

const StatusBar = ({ onCreateRoom, emit }) => {
  const {
    user,
    users,
    rooms,
    unreadCounts,
    isGlobalChatOpen,
    toggleGlobalChat,
  } = useCosmosStore();

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  const globalUnread = unreadCounts['global'] || 0;
  const userHasRoom = rooms.some((r) => r.ownerId === user?.odestined);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="fixed top-4 left-4 right-4 flex items-center justify-between z-40"
    >
      {/* Left - Logo & User Info */}
      <div className="flex items-center gap-4">
        <div className="glass rounded-2xl px-5 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-lg">🌌</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg">Virtual Cosmos</h1>
              <p className="text-xs text-gray-400">{users.length + 1} online</p>
            </div>
          </div>

          <div className="h-8 w-px bg-purple-500/30" />

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: user?.avatar?.color || '#6366f1' }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-white font-medium">{user?.name}</span>
          </div>
        </div>
      </div>

      {/* Center - Notifications */}
      {totalUnread > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="glass rounded-full px-4 py-2 flex items-center gap-2"
        >
          <Bell className="w-4 h-4 text-yellow-400" />
          <span className="text-white text-sm font-medium">
            {totalUnread} new message{totalUnread !== 1 ? 's' : ''}
          </span>
        </motion.div>
      )}

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* Global Chat Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleGlobalChat}
          className={`glass rounded-xl px-4 py-3 flex items-center gap-2 transition-all relative ${
            isGlobalChatOpen ? 'ring-2 ring-purple-500' : ''
          }`}
        >
          <Globe className="w-5 h-5 text-purple-400" />
          <span className="text-white font-medium">Global Chat</span>
          {globalUnread > 0 && !isGlobalChatOpen && (
            <span className="notification-badge">{globalUnread > 99 ? '99+' : globalUnread}</span>
          )}
        </motion.button>

        {/* Create Room Button */}
        {!userHasRoom && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateRoom}
            className="glass rounded-xl px-4 py-3 flex items-center gap-2 hover:bg-purple-500/20 transition-all"
          >
            <Plus className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">Create Room</span>
          </motion.button>
        )}

        {/* Settings placeholder */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass rounded-xl p-3 hover:bg-purple-500/20 transition-all"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default StatusBar;
