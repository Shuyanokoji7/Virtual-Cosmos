import React, { useState, useRef, useEffect } from 'react';
import { useCosmosStore } from '../store';

const ChatPanel = ({ roomId, emit, socket }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  const { 
    messages, 
    proximityUsers, 
    user,
    clearUnread,
    setActiveChatRoom,
  } = useCosmosStore();

  const chatMessages = messages[roomId] || [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Clear unread when panel is visible
  useEffect(() => {
    clearUnread(roomId);
    emit('chat:read', { roomId });
  }, [roomId, clearUnread, emit]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    emit('chat:message', {
      roomId,
      content: message.trim(),
    });

    setMessage('');
  };

  const handleClose = () => {
    setActiveChatRoom(null);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="absolute bottom-4 left-4 w-80 glass-chat rounded-2xl shadow-lg overflow-hidden z-30 glow-chat">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <h3 className="font-semibold text-cyan-100">Proximity Chat</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Nearby users */}
        <div className="flex items-center gap-1 mt-2">
          {proximityUsers.map((nearbyUser) => (
            <div
              key={nearbyUser.odestined}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{
                background: `linear-gradient(135deg, ${nearbyUser.avatar?.color || '#6366f1'} 0%, ${nearbyUser.avatar?.color || '#6366f1'}bb 100%)`,
              }}
              title={nearbyUser.name}
            >
              {nearbyUser.name?.charAt(0).toUpperCase()}
            </div>
          ))}
          {proximityUsers.length > 0 && (
            <span className="text-xs text-gray-400 ml-1">
              {proximityUsers.length} nearby
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3 chat-scrollbar">
        {chatMessages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Start a conversation!</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isOwn = msg.senderId === user?.odestined;
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-md'
                      : 'bg-chat-surface text-chat-text rounded-bl-md'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs text-cyan-400 font-medium mb-1">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-cyan-200/70' : 'text-gray-400'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-cyan-500/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-chat-surface border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 text-sm chat-input transition-colors"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-500 hover:to-blue-500 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
