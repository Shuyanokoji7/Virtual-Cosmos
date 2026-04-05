import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarPreview3D, CHARACTER_MODELS } from './Avatar3D';
import { Sparkles, Users, Globe, Zap, ArrowRight, Palette } from 'lucide-react';

const AVATAR_COLORS = [
  { id: 'violet', color: '#8b5cf6', name: 'Violet' },
  { id: 'purple', color: '#a855f7', name: 'Purple' },
  { id: 'pink', color: '#ec4899', name: 'Pink' },
  { id: 'rose', color: '#f43f5e', name: 'Rose' },
  { id: 'orange', color: '#f97316', name: 'Orange' },
  { id: 'amber', color: '#f59e0b', name: 'Amber' },
  { id: 'lime', color: '#84cc16', name: 'Lime' },
  { id: 'emerald', color: '#10b981', name: 'Emerald' },
  { id: 'teal', color: '#14b8a6', name: 'Teal' },
  { id: 'cyan', color: '#06b6d4', name: 'Cyan' },
  { id: 'sky', color: '#0ea5e9', name: 'Sky' },
  { id: 'blue', color: '#3b82f6', name: 'Blue' },
];

// Floating particles background
const FloatingParticles = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-violet-400/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Feature card component
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
  >
    <div className="p-2 rounded-lg bg-violet-600/30">
      <Icon className="w-4 h-4 text-violet-300" />
    </div>
    <div>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
  </motion.div>
);

const LobbyScreen = ({ emit }) => {
  const [name, setName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('male-a');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0].color);
  const [isJoining, setIsJoining] = useState(false);
  const [showCharacterGrid, setShowCharacterGrid] = useState(false);
  const [currentGender, setCurrentGender] = useState('all');

  // Filter characters by gender
  const filteredCharacters = CHARACTER_MODELS.filter(
    (c) => currentGender === 'all' || c.gender === currentGender
  );

  const handleJoin = () => {
    if (!name.trim()) {
      return;
    }

    setIsJoining(true);
    
    const storedId = localStorage.getItem('cosmos_user_id');
    
    emit('user:join', {
      name: name.trim(),
      avatar: {
        characterId: selectedCharacter,
        color: selectedColor,
        style: 'default',
      },
      odestined: storedId || undefined,
    });
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2d] to-[#1a0a2e] overflow-hidden">
      {/* Animated background */}
      <FloatingParticles />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-3xl" />

      {/* Main content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex gap-8 max-w-5xl mx-4"
      >
        {/* Left panel - Info */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:flex flex-col justify-center w-80"
        >
          <div className="mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4 shadow-2xl shadow-violet-500/30"
            >
              <Globe className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent mb-2">
              Virtual Cosmos
            </h1>
            <p className="text-gray-400 text-lg">
              Your gateway to the social metaverse
            </p>
          </div>

          <div className="space-y-3">
            <FeatureCard 
              icon={Users}
              title="Meet & Connect"
              description="Walk around and meet people nearby"
              delay={0.4}
            />
            <FeatureCard 
              icon={Zap}
              title="Real-time Chat"
              description="Instant messaging with proximity detection"
              delay={0.5}
            />
            <FeatureCard 
              icon={Sparkles}
              title="3D Avatars"
              description="Express yourself with customizable characters"
              delay={0.6}
            />
          </div>
        </motion.div>

        {/* Right panel - Join form */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-3 shadow-xl shadow-violet-500/30">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Virtual Cosmos</h1>
            </div>

            {/* Avatar Preview - BIGGER */}
            <motion.div 
              layout
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <AvatarPreview3D 
                  characterId={selectedCharacter}
                  color={selectedColor}
                  size={220}
                  autoRotate={true}
                />
                
                {/* Character select button */}
                <button
                  onClick={() => setShowCharacterGrid(!showCharacterGrid)}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-5 py-2 bg-violet-600/80 hover:bg-violet-500 rounded-full text-sm font-medium text-white transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Users className="w-4 h-4" />
                  Change Character
                </button>
              </div>
            </motion.div>

            {/* Character Grid */}
            <AnimatePresence>
              {showCharacterGrid && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  {/* Gender filter */}
                  <div className="flex gap-2 mb-3 justify-center">
                    {['all', 'male', 'female'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setCurrentGender(g)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          currentGender === g
                            ? 'bg-violet-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  {/* Character grid - BIGGER */}
                  <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1 scrollbar-thin">
                    {filteredCharacters.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => {
                          setSelectedCharacter(char.id);
                          setShowCharacterGrid(false);
                        }}
                        className={`
                          relative p-2 rounded-xl transition-all
                          ${selectedCharacter === char.id 
                            ? 'bg-violet-600/40 ring-2 ring-violet-400' 
                            : 'bg-white/5 hover:bg-white/10'
                          }
                        `}
                      >
                        <AvatarPreview3D 
                          characterId={char.id}
                          color={selectedColor}
                          size={75}
                          autoRotate={false}
                        />
                        <span className="block text-xs text-gray-400 text-center mt-1">
                          {char.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name Input */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  maxLength={20}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                />
                {name.length > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    {name.length}/20
                  </span>
                )}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                <Palette className="w-4 h-4" />
                Accent Color
              </label>
              <div className="flex flex-wrap gap-2 justify-center">
                {AVATAR_COLORS.map(({ id, color }) => (
                  <motion.button
                    key={id}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-shadow ${
                      selectedColor === color 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#12122a]' 
                        : 'hover:ring-2 hover:ring-white/30'
                    }`}
                    style={{ 
                      backgroundColor: color,
                      boxShadow: selectedColor === color ? `0 0 20px ${color}60` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Join Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={isJoining || !name.trim()}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl font-semibold text-white shadow-xl shadow-violet-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-violet-600 disabled:hover:to-purple-600 flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Entering Cosmos...
                </>
              ) : (
                <>
                  Enter Cosmos
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {/* Footer */}
            <p className="text-center text-gray-500 text-sm mt-5">
              Use arrow keys to move • Chat when nearby
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LobbyScreen;
