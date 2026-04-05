import React, { useState, useRef, useEffect } from 'react';
import { useCosmosStore } from '../store';

const GlobalChat = ({ emit }) => {
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState({ x: window.innerWidth - 400, y: window.innerHeight - 480 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);
  
  const { 
    messages, 
    user,
    users,
    clearUnread,
    setGlobalChatOpen,
  } = useCosmosStore();

  const chatMessages = messages['global'] || [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Clear unread when panel is visible
  useEffect(() => {
    clearUnread('global');
    emit('chat:read', { roomId: 'global' });
  }, [clearUnread, emit]);

  // Handle drag
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      const panelWidth = 384;
      const panelHeight = 480;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - panelWidth, newX)),
        y: Math.max(0, Math.min(window.innerHeight - panelHeight, newY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e) => {
    if (e.target.closest('input') || e.target.closest('button') || e.target.closest('.chat-messages')) return;
    setIsDragging(true);
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    emit('chat:message', {
      roomId: 'global',
      content: message.trim(),
    });

    setMessage('');
  };

  const handleClose = () => {
    setGlobalChatOpen(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserAvatar = (senderId) => {
    const sender = users.find((u) => u.odestined === senderId);
    return sender?.avatar?.color || '#6366f1';
  };

  return (
    <div 
      ref={panelRef}
      className="fixed w-96 glass-chat rounded-2xl shadow-lg overflow-hidden z-30 glow-chat"
      style={{ left: position.x, top: position.y }}
    >
      {/* Header - Draggable */}
      <div 
        className="px-4 py-3 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-b border-violet-500/20 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-violet-100">Global Chat</h3>
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
        <p className="text-xs text-gray-400 mt-1">
          Everyone in the cosmos can see this
        </p>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-3 chat-scrollbar chat-messages">
        {chatMessages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet</p>
            <p className="text-xs mt-1">Be the first to say hello!</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isOwn = msg.senderId === user?.odestined;
            
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium text-white"
                  style={{
                    background: `linear-gradient(135deg, ${getUserAvatar(msg.senderId)} 0%, ${getUserAvatar(msg.senderId)}bb 100%)`,
                  }}
                >
                  {msg.senderName?.charAt(0).toUpperCase()}
                </div>
                
                {/* Message */}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-md'
                      : 'bg-chat-surface text-chat-text rounded-bl-md'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs text-violet-400 font-medium mb-1">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-violet-200/70' : 'text-gray-400'}`}>
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
      <form onSubmit={handleSendMessage} className="p-3 border-t border-violet-500/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a global message..."
            className="flex-1 px-4 py-2 bg-[#1e3a5f] border border-violet-500/30 rounded-xl text-sm chat-input transition-colors focus:outline-none focus:border-violet-400"
            style={{ color: '#ffffff', caretColor: '#ffffff', WebkitTextFillColor: '#ffffff' }}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-violet-500 hover:to-purple-500 transition-all"
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

export default GlobalChat;
