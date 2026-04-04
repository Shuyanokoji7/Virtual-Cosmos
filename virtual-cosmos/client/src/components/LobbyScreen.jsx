import React, { useState, useEffect, useRef } from 'react';

const STAR_COUNT = 80;

function Star({ style }) {
  return <div className="star" style={style} />;
}

export default function LobbyScreen({ onJoin }) {
  const [name, setName] = useState('');
  const [stars] = useState(() =>
    Array.from({ length: STAR_COUNT }, (_, i) => ({
      key: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        '--duration': `${2 + Math.random() * 4}s`,
        '--delay': `${Math.random() * 3}s`,
        width: `${1 + Math.random() * 2}px`,
        height: `${1 + Math.random() * 2}px`,
      },
    }))
  );

  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      onJoin(name.trim());
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-cosmos-bg relative overflow-hidden">
      {/* Starfield */}
      {stars.map((s) => (
        <Star key={s.key} style={s.style} />
      ))}

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-teal-400/8 rounded-full blur-[80px]" />

      {/* Main Card */}
      <div className="relative z-10 animate-fade-in">
        <div className="bg-cosmos-surface/80 backdrop-blur-xl border border-cosmos-border rounded-2xl p-10 w-[440px] shadow-2xl shadow-purple-900/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 mb-4 shadow-lg shadow-purple-500/30">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="8" opacity="0.5" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2" opacity="0.3" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Virtual Cosmos
            </h1>
            <p className="text-cosmos-muted mt-2 text-sm">
              Enter your name to join the cosmos
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="relative mb-6">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name..."
                maxLength={20}
                className="w-full bg-cosmos-bg/60 border border-cosmos-border rounded-xl px-5 py-3.5
                  text-white placeholder-cosmos-muted/50 text-base
                  focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20
                  transition-all duration-200"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-cosmos-muted/40 font-mono">
                {name.length}/20
              </span>
            </div>

            <button
              type="submit"
              disabled={name.trim().length < 2}
              className="w-full py-3.5 rounded-xl font-semibold text-base
                bg-gradient-to-r from-purple-600 to-blue-600
                hover:from-purple-500 hover:to-blue-500
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-300 shadow-lg shadow-purple-600/25
                hover:shadow-purple-500/40 hover:-translate-y-0.5
                active:translate-y-0"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Enter the Cosmos →
            </button>
          </form>

          {/* Instructions */}
          <div className="mt-6 pt-5 border-t border-cosmos-border/50">
            <p className="text-xs text-cosmos-muted/60 text-center mb-3">How it works</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-cosmos-bg/40 rounded-lg p-3">
                <div className="text-lg mb-1">⌨️</div>
                <div className="text-[10px] text-cosmos-muted leading-tight">WASD / Arrow keys to move</div>
              </div>
              <div className="bg-cosmos-bg/40 rounded-lg p-3">
                <div className="text-lg mb-1">👋</div>
                <div className="text-[10px] text-cosmos-muted leading-tight">Walk near others to connect</div>
              </div>
              <div className="bg-cosmos-bg/40 rounded-lg p-3">
                <div className="text-lg mb-1">💬</div>
                <div className="text-[10px] text-cosmos-muted leading-tight">Chat appears on proximity</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
