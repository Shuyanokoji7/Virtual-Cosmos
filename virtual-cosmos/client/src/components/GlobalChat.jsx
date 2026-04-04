import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Globe, UserX, ThumbsDown, Users } from 'lucide-react';
import { useCosmosStore } from '../store';

const GlobalChat = ({ emit }) => {
  const [message, setMessage] = useState('');
  const [showVoteMenu, setShowVoteMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    user,
    users,
    voteKicks,
    setGlobalChatOpen,
    clearUnread,
  } = useCosmosStore();

  const chatMessages = messages['global'] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    clearUnread('global');
    emit('chat:read', { roomId: 'global' });
  }, [clearUnread, emit]);

  const handleSend = () => {
    if (!message.trim()) return;

    emit('chat:message', {
      roomId: 'global',
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

  const handleClose = () => {
    setGlobalChatOpen(false);
  };

  const handleVoteKick = (targetUserId) => {
    emit('vote:kick', { targetUserId });
    setShowVoteMenu(false);
  };

  const hasVoted = (targetUserId) => {
    const votes = voteKicks[targetUserId];
    return votes?.voters?.includes(user?.odestined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed left-4 bottom-4 w-[420px] h-[550px] glass rounded-2xl flex flex-col overflow-hidden glow-accent"
    >
      {/* Header */}
      <div className="bg-purple-900/40 px-4 py-3 flex items-center justify-between border-b border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/30 rounded-lg">
            <Globe className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white">
              Global Chat
            </h3>
            <p className="text-xs text-purple-300/70">
              <Users className="w-3 h-3 inline mr-1" />
              {users.length + 1} online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowVoteMenu(!showVoteMenu)}
              className="p-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
              title="Vote to kick"
            >
              <UserX className="w-4 h-4" />
            </motion.button>

            {/* Vote Menu Dropdown */}
            <AnimatePresence>
              {showVoteMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-64 glass rounded-xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-purple-500/20">
                    <p className="text-sm font-medium text-purple-300">Vote to Remove User</p>
                    <p className="text-xs text-gray-400 mt-1">50% votes needed to remove</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {users.map((u) => {
                      const votes = voteKicks[u.odestined];
                      const voted = hasVoted(u.odestined);
                      return (
                        <button
                          key={u.odestined}
                          onClick={() => handleVoteKick(u.odestined)}
                          disabled={voted}
                          className={`w-full px-4 py-3 flex items-center justify-between hover:bg-purple-500/10 transition-colors ${
                            voted ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <span className="text-sm text-white">{u.name}</span>
                          <div className="flex items-center gap-2">
                            {votes && (
                              <span className="text-xs text-orange-400">
                                {votes.voteCount}/{votes.threshold}
                              </span>
                            )}
                            <ThumbsDown className={`w-4 h-4 ${voted ? 'text-orange-500' : 'text-gray-400'}`} />
                          </div>
                        </button>
                      );
                    })}
                    {users.length === 0 && (
                      <p className="px-4 py-3 text-sm text-gray-400">No other users online</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Globe className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs opacity-70">Start the conversation!</p>
            </div>
          )}
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
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md'
                      : 'bg-cosmos-surface/80 text-white rounded-bl-md border border-purple-500/20'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-medium text-purple-400 mb-1">
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
      <div className="p-4 bg-purple-900/20 border-t border-purple-500/20">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message everyone..."
            className="flex-1 px-4 py-3 bg-cosmos-surface/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!message.trim()}
            className={`px-4 py-3 rounded-xl font-medium transition-all ${
              message.trim()
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
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

export default GlobalChat;
