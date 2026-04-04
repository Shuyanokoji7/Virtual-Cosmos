import React, { useState, useRef, useEffect } from 'react';

export default function ChatPanel({ roomId, peerName, peerColor, messages, mySocketId, onSend }) {
  const [input, setInput] = useState('');
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
      inputRef.current?.focus();
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="absolute right-4 bottom-4 animate-slide-up z-50" style={{ width: '340px' }}>
      <div className="bg-cosmos-surface/95 backdrop-blur-xl border border-cosmos-border rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-cosmos-border/50 cursor-pointer hover:bg-cosmos-panel/50 transition-colors"
          onClick={() => setMinimized(!minimized)}
        >
          <div className="flex items-center gap-3">
            {/* Peer avatar dot */}
            <div className="relative">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: peerColor }}
              >
                {peerName[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-cosmos-surface rounded-full" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {peerName}
              </div>
              <div className="text-[10px] text-cosmos-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cosmos-success rounded-full animate-pulse" />
                Connected
              </div>
            </div>
          </div>
          <button className="text-cosmos-muted hover:text-white transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {minimized ? (
                <polyline points="18 15 12 9 6 15" />
              ) : (
                <polyline points="6 9 12 15 18 9" />
              )}
            </svg>
          </button>
        </div>

        {!minimized && (
          <>
            {/* Messages */}
            <div className="h-64 overflow-y-auto px-4 py-3 space-y-2.5">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-2xl mb-2">👋</div>
                  <p className="text-cosmos-muted text-xs">
                    You're now connected with <span className="font-semibold text-cosmos-text">{peerName}</span>
                  </p>
                  <p className="text-cosmos-muted/50 text-[10px] mt-1">
                    Say hello!
                  </p>
                </div>
              )}

              {messages.map((msg, i) => {
                const isMe = msg.senderId === mySocketId;
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                        isMe
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-md'
                          : 'bg-cosmos-panel text-cosmos-text rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      <p className={`text-[9px] mt-1 ${isMe ? 'text-white/50' : 'text-cosmos-muted/50'} text-right`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-3 pb-3">
              <div className="flex items-center gap-2 bg-cosmos-bg/60 rounded-xl border border-cosmos-border/50 px-3 py-1.5 focus-within:border-purple-500/40 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-cosmos-muted/40 outline-none py-1.5"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:hover:bg-purple-600 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
