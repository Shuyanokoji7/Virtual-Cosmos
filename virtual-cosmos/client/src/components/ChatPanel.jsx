import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Ban, Phone, Video, UserX } from 'lucide-react';
import { useCosmosStore } from '../store';
import { useWebRTC } from '../hooks/useWebRTC';

const ChatPanel = ({ roomId, emit, socket }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    proximityUsers,
    user,
    blockedUsers,
    setActiveChatRoom,
    clearUnread,
  } = useCosmosStore();

  const { startCall } = useWebRTC(socket);

  const chatMessages = messages[roomId] || [];
  const connectedUser = proximityUsers[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    clearUnread(roomId);
    emit('chat:read', { roomId });
  }, [roomId, clearUnread, emit]);

  const handleSend = () => {
    if (!message.trim()) return;

    emit('chat:message', {
      roomId,
      content: message.trim(),
    });

    setMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBlock = (userId) => {
    emit('user:block', { targetUserId: userId });
  };

  const handleClose = () => {
    setActiveChatRoom(null);
  };

  const handleVoiceCall = () => {
    if (connectedUser) {
      startCall(connectedUser.odestined, 'voice');
    }
  };

  const handleVideoCall = () => {
    if (connectedUser) {
      startCall(connectedUser.odestined, 'video');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed right-4 bottom-4 w-96 h-[500px] glass-chat rounded-2xl flex flex-col overflow-hidden glow-chat"
    >
      {/* Header */}
      <div className="bg-cosmos-chat-surface/80 px-4 py-3 flex items-center justify-between border-b border-cosmos-chat-border/30">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <div>
            <h3 className="font-display font-semibold text-cosmos-chat-text">
              {connectedUser?.name || 'Proximity Chat'}
            </h3>
            <p className="text-xs text-cosmos-chat-accent/70">Connected nearby</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connectedUser && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleVoiceCall}
                className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleVideoCall}
                className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleBlock(connectedUser.odestined)}
                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                title="Block User"
              >
                <Ban className="w-4 h-4" />
              </motion.button>
            </>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="p-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scrollbar">
        <AnimatePresence>
          {chatMessages.map((msg, index) => {
            const isOwn = msg.senderId === user?.odestined;
            return (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-cosmos-chat-accent text-white rounded-br-md'
                      : 'bg-cosmos-chat-surface text-cosmos-chat-text rounded-bl-md'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-medium text-cosmos-chat-accent mb-1">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-cosmos-chat-surface/50 border-t border-cosmos-chat-border/30">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-cosmos-chat-bg border border-cosmos-chat-border/50 rounded-xl text-cosmos-chat-text placeholder-gray-500 chat-input transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!message.trim()}
            className={`px-4 py-3 rounded-xl font-medium transition-all ${
              message.trim()
                ? 'bg-cosmos-chat-accent text-white shadow-lg shadow-cosmos-chat-accent/30'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPanel;
