import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, Palette } from 'lucide-react';

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#eab308', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
];

const AVATAR_STYLES = [
  { id: 'round', name: 'Round', headShape: 'circle' },
  { id: 'square', name: 'Square', headShape: 'rounded-square' },
  { id: 'cat', name: 'Cat', headShape: 'cat' },
  { id: 'robot', name: 'Robot', headShape: 'robot' },
  { id: 'alien', name: 'Alien', headShape: 'alien' },
];

const AvatarPreview = ({ color, style, size = 120 }) => {
  const renderHead = () => {
    switch (style) {
      case 'cat':
        return (
          <g>
            {/* Cat ears */}
            <path d={`M${size*0.2},${size*0.35} L${size*0.35},${size*0.15} L${size*0.45},${size*0.35}`} fill={color} />
            <path d={`M${size*0.8},${size*0.35} L${size*0.65},${size*0.15} L${size*0.55},${size*0.35}`} fill={color} />
            {/* Inner ears */}
            <path d={`M${size*0.25},${size*0.35} L${size*0.35},${size*0.22} L${size*0.42},${size*0.35}`} fill="#fecaca" />
            <path d={`M${size*0.75},${size*0.35} L${size*0.65},${size*0.22} L${size*0.58},${size*0.35}`} fill="#fecaca" />
            {/* Head */}
            <ellipse cx={size/2} cy={size*0.5} rx={size*0.35} ry={size*0.32} fill={color} />
            {/* Face */}
            <ellipse cx={size*0.38} cy={size*0.45} rx={size*0.08} ry={size*0.1} fill="white" />
            <ellipse cx={size*0.62} cy={size*0.45} rx={size*0.08} ry={size*0.1} fill="white" />
            <circle cx={size*0.38} cy={size*0.47} r={size*0.04} fill="#1e293b" />
            <circle cx={size*0.62} cy={size*0.47} r={size*0.04} fill="#1e293b" />
            {/* Nose & whiskers */}
            <ellipse cx={size/2} cy={size*0.55} rx={size*0.03} ry={size*0.025} fill="#fecaca" />
            <line x1={size*0.25} y1={size*0.52} x2={size*0.42} y2={size*0.55} stroke="#1e293b" strokeWidth="1.5" />
            <line x1={size*0.25} y1={size*0.58} x2={size*0.42} y2={size*0.58} stroke="#1e293b" strokeWidth="1.5" />
            <line x1={size*0.75} y1={size*0.52} x2={size*0.58} y2={size*0.55} stroke="#1e293b" strokeWidth="1.5" />
            <line x1={size*0.75} y1={size*0.58} x2={size*0.58} y2={size*0.58} stroke="#1e293b" strokeWidth="1.5" />
          </g>
        );
      case 'robot':
        return (
          <g>
            {/* Antenna */}
            <line x1={size/2} y1={size*0.1} x2={size/2} y2={size*0.22} stroke="#94a3b8" strokeWidth="3" />
            <circle cx={size/2} cy={size*0.1} r={size*0.04} fill="#ef4444" />
            {/* Head */}
            <rect x={size*0.2} y={size*0.22} width={size*0.6} height={size*0.45} rx={size*0.05} fill={color} />
            {/* Eyes */}
            <rect x={size*0.28} y={size*0.35} width={size*0.15} height={size*0.12} rx={size*0.02} fill="#0ea5e9" />
            <rect x={size*0.57} y={size*0.35} width={size*0.15} height={size*0.12} rx={size*0.02} fill="#0ea5e9" />
            {/* Mouth */}
            <rect x={size*0.35} y={size*0.55} width={size*0.3} height={size*0.06} rx={size*0.02} fill="#1e293b" />
            {/* Bolts */}
            <circle cx={size*0.25} cy={size*0.45} r={size*0.025} fill="#94a3b8" />
            <circle cx={size*0.75} cy={size*0.45} r={size*0.025} fill="#94a3b8" />
          </g>
        );
      case 'alien':
        return (
          <g>
            {/* Head */}
            <ellipse cx={size/2} cy={size*0.45} rx={size*0.38} ry={size*0.4} fill={color} />
            {/* Big eyes */}
            <ellipse cx={size*0.35} cy={size*0.42} rx={size*0.12} ry={size*0.15} fill="#1e293b" />
            <ellipse cx={size*0.65} cy={size*0.42} rx={size*0.12} ry={size*0.15} fill="#1e293b" />
            <ellipse cx={size*0.37} cy={size*0.4} rx={size*0.05} ry={size*0.06} fill="#22c55e" />
            <ellipse cx={size*0.67} cy={size*0.4} rx={size*0.05} ry={size*0.06} fill="#22c55e" />
            {/* Highlight */}
            <circle cx={size*0.33} cy={size*0.37} r={size*0.02} fill="white" />
            <circle cx={size*0.63} cy={size*0.37} r={size*0.02} fill="white" />
            {/* Mouth */}
            <path d={`M${size*0.42},${size*0.62} Q${size/2},${size*0.68} ${size*0.58},${size*0.62}`} fill="none" stroke="#1e293b" strokeWidth="2" />
          </g>
        );
      case 'rounded-square':
        return (
          <g>
            {/* Head */}
            <rect x={size*0.2} y={size*0.2} width={size*0.6} height={size*0.55} rx={size*0.12} fill={color} />
            {/* Eyes */}
            <ellipse cx={size*0.38} cy={size*0.42} rx={size*0.08} ry={size*0.1} fill="white" />
            <ellipse cx={size*0.62} cy={size*0.42} rx={size*0.08} ry={size*0.1} fill="white" />
            <circle cx={size*0.38} cy={size*0.44} r={size*0.04} fill="#1e293b" />
            <circle cx={size*0.62} cy={size*0.44} r={size*0.04} fill="#1e293b" />
            {/* Blush */}
            <ellipse cx={size*0.28} cy={size*0.52} rx={size*0.05} ry={size*0.03} fill="#fecaca" opacity="0.6" />
            <ellipse cx={size*0.72} cy={size*0.52} rx={size*0.05} ry={size*0.03} fill="#fecaca" opacity="0.6" />
            {/* Smile */}
            <path d={`M${size*0.4},${size*0.58} Q${size/2},${size*0.68} ${size*0.6},${size*0.58}`} fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      default: // circle
        return (
          <g>
            {/* Head */}
            <circle cx={size/2} cy={size*0.45} r={size*0.35} fill={color} />
            {/* Eyes */}
            <ellipse cx={size*0.38} cy={size*0.4} rx={size*0.08} ry={size*0.1} fill="white" />
            <ellipse cx={size*0.62} cy={size*0.4} rx={size*0.08} ry={size*0.1} fill="white" />
            <circle cx={size*0.38} cy={size*0.42} r={size*0.04} fill="#1e293b" />
            <circle cx={size*0.62} cy={size*0.42} r={size*0.04} fill="#1e293b" />
            {/* Highlight */}
            <circle cx={size*0.36} cy={size*0.39} r={size*0.015} fill="white" />
            <circle cx={size*0.6} cy={size*0.39} r={size*0.015} fill="white" />
            {/* Blush */}
            <ellipse cx={size*0.28} cy={size*0.48} rx={size*0.05} ry={size*0.03} fill="#fecaca" opacity="0.5" />
            <ellipse cx={size*0.72} cy={size*0.48} rx={size*0.05} ry={size*0.03} fill="#fecaca" opacity="0.5" />
            {/* Smile */}
            <path d={`M${size*0.4},${size*0.55} Q${size/2},${size*0.65} ${size*0.6},${size*0.55}`} fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
    }
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3"/>
        </filter>
        <linearGradient id={`bodyGrad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      
      {/* Body */}
      <ellipse 
        cx={size/2} 
        cy={size*0.85} 
        rx={size*0.25} 
        ry={size*0.15} 
        fill={`url(#bodyGrad-${color.replace('#', '')})`}
        filter="url(#shadow)"
      />
      
      {/* Head with style */}
      <g filter="url(#shadow)">
        {renderHead()}
      </g>
    </svg>
  );
};

const LobbyScreen = ({ emit }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [selectedStyle, setSelectedStyle] = useState('round');

  const handleJoin = () => {
    if (name.trim()) {
      const savedId = localStorage.getItem('cosmos-user-id');
      emit('user:join', {
        name: name.trim(),
        odestined: savedId || undefined,
        avatar: {
          color: selectedColor,
          style: selectedStyle,
        },
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-cosmos-bg overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass rounded-3xl p-8 w-full max-w-md mx-4 relative"
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-xl -z-10" />

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-12 h-12 text-purple-400" />
          </motion.div>
          <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Virtual Cosmos
          </h1>
          <p className="text-gray-400 mt-2 font-body">
            Enter the universe of connection
          </p>
        </div>

        {/* Avatar Preview */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <AvatarPreview color={selectedColor} style={selectedStyle} size={120} />
          </motion.div>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your cosmic name..."
            className="w-full px-4 py-3 bg-cosmos-surface/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 transition-all"
            maxLength={20}
          />
        </div>

        {/* Avatar Style Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Avatar Style
          </label>
          <div className="flex gap-2 flex-wrap">
            {AVATAR_STYLES.map((style) => (
              <motion.button
                key={style.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStyle(style.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedStyle === style.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-cosmos-surface/50 text-gray-300 hover:bg-purple-500/20'
                }`}
              >
                {style.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Palette className="w-4 h-4 inline mr-2" />
            Avatar Color
          </label>
          <div className="flex flex-wrap gap-2 justify-center">
            {AVATAR_COLORS.map((color) => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full transition-all ${
                  selectedColor === color
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-cosmos-bg'
                    : 'hover:ring-2 hover:ring-white/50'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Join Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleJoin}
          disabled={!name.trim()}
          className={`w-full py-4 rounded-xl font-display font-semibold text-lg transition-all ${
            name.trim()
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          Enter the Cosmos ✨
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LobbyScreen;
