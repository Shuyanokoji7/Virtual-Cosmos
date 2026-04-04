import React, { useState } from 'react';

export default function UserList({ users, myData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="absolute top-16 left-4 z-40">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 bg-cosmos-surface/80 backdrop-blur-xl border border-cosmos-border rounded-xl px-3 py-2 hover:bg-cosmos-panel/80 transition-colors shadow-lg"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a29bfe" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className="text-xs font-medium text-cosmos-text">
          {users.length} {users.length === 1 ? 'user' : 'users'}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-cosmos-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && users.length > 0 && (
        <div className="mt-2 bg-cosmos-surface/90 backdrop-blur-xl border border-cosmos-border rounded-xl overflow-hidden shadow-xl animate-slide-up w-52">
          <div className="px-3 py-2 border-b border-cosmos-border/50">
            <span className="text-[10px] font-semibold text-cosmos-muted uppercase tracking-wider">
              Online Now
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.socketId}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-cosmos-panel/40 transition-colors"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-xs text-cosmos-text truncate">{user.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
