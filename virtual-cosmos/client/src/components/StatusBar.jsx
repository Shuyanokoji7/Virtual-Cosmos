import React from 'react';

export default function StatusBar({ username, userCount, connectionCount }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-40">
      <div className="flex items-center justify-between px-5 py-3 bg-cosmos-surface/70 backdrop-blur-xl border-b border-cosmos-border/30">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md shadow-purple-500/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="8" opacity="0.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Virtual Cosmos
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5">
          {/* Online count */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-cosmos-muted font-mono">{userCount} online</span>
            </div>
          </div>

          {/* Connection count */}
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a29bfe" strokeWidth="2">
              <path d="M8 12h8M12 8v8" />
              <circle cx="12" cy="12" r="10" opacity="0.3" />
            </svg>
            <span className="text-xs text-cosmos-muted font-mono">
              {connectionCount} {connectionCount === 1 ? 'connection' : 'connections'}
            </span>
          </div>

          {/* User identity */}
          <div className="flex items-center gap-2 bg-cosmos-bg/40 rounded-lg px-3 py-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-blue-400" />
            <span className="text-xs font-medium text-white">{username}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
