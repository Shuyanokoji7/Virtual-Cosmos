import React, { useState } from 'react';

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#6366f1',
];

const AVATAR_STYLES = ['default', 'round', 'square', 'hexagon'];

const AvatarPreview = ({ color, style }) => {
  const getShape = () => {
    switch (style) {
      case 'round':
        return 'rounded-full';
      case 'square':
        return 'rounded-md';
      case 'hexagon':
        return 'rounded-xl';
      default:
        return 'rounded-2xl';
    }
  };

  return (
    <div className="relative">
      <div
        className={`w-24 h-24 ${getShape()} flex items-center justify-center shadow-lg transition-all duration-300`}
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`,
          boxShadow: `0 0 30px ${color}50`,
        }}
      >
        {/* Face */}
        <div className="relative w-16 h-16">
          {/* Eyes */}
          <div className="absolute top-3 left-2 w-3 h-3 bg-white rounded-full">
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-gray-800 rounded-full" />
          </div>
          <div className="absolute top-3 right-2 w-3 h-3 bg-white rounded-full">
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-gray-800 rounded-full" />
          </div>
          {/* Mouth */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-2 border-b-2 border-white rounded-b-full" />
        </div>
      </div>
      {/* Glow ring */}
      <div
        className={`absolute inset-0 ${getShape()} opacity-30 animate-pulse`}
        style={{
          boxShadow: `0 0 40px ${color}`,
        }}
      />
    </div>
  );
};

const LobbyScreen = ({ emit }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsJoining(true);
    
    // Get stored ID or create new one
    const storedId = localStorage.getItem('cosmos_user_id');
    
    emit('user:join', {
      name: name.trim(),
      avatar: {
        color: selectedColor,
        style: selectedStyle,
      },
      odestined: storedId || undefined,
    });
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-cosmos-bg overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-bg absolute inset-0 opacity-50" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main card */}
      <div className="glass rounded-3xl p-8 w-full max-w-md mx-4 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Virtual Cosmos
          </h1>
          <p className="text-gray-400 mt-2">Enter the social metaverse</p>
        </div>

        {/* Avatar Preview */}
        <div className="flex justify-center mb-6">
          <AvatarPreview color={selectedColor} style={selectedStyle} />
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
            className="w-full px-4 py-3 bg-cosmos-surface border border-violet-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
          />
        </div>

        {/* Color Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Avatar Color
          </label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                  selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-cosmos-bg scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Style Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Avatar Style
          </label>
          <div className="flex gap-2">
            {AVATAR_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-4 py-2 rounded-lg capitalize text-sm transition-all ${
                  selectedStyle === style
                    ? 'bg-violet-600 text-white'
                    : 'bg-cosmos-surface text-gray-400 hover:bg-violet-600/20'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoin}
          disabled={isJoining}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isJoining ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Entering Cosmos...
            </span>
          ) : (
            'Enter Cosmos'
          )}
        </button>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Move with arrow keys • Chat when nearby • Have fun!
        </p>
      </div>
    </div>
  );
};

export default LobbyScreen;
