import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Sparkles, Briefcase, Coffee, TreePine, Zap, Palette, Clock } from 'lucide-react';
import { useCosmosStore } from '../store';

const BACKGROUND_OPTIONS = [
  { id: 'cozy', name: 'Cozy', icon: Home, color: 'from-purple-500 to-pink-500', description: 'Warm and comfortable' },
  { id: 'professional', name: 'Professional', icon: Briefcase, color: 'from-blue-500 to-cyan-500', description: 'Clean and modern' },
  { id: 'warm', name: 'Warm', icon: Coffee, color: 'from-orange-500 to-red-500', description: 'Inviting atmosphere' },
  { id: 'cosmic', name: 'Cosmic', icon: Sparkles, color: 'from-violet-500 to-purple-600', description: 'Space-themed' },
  { id: 'nature', name: 'Nature', icon: TreePine, color: 'from-green-500 to-emerald-500', description: 'Natural and fresh' },
  { id: 'minimal', name: 'Minimal', icon: Palette, color: 'from-gray-500 to-slate-500', description: 'Simple and clean' },
  { id: 'retro', name: 'Retro', icon: Clock, color: 'from-amber-500 to-yellow-500', description: 'Vintage vibes' },
  { id: 'neon', name: 'Neon', icon: Zap, color: 'from-pink-500 to-cyan-500', description: 'Vibrant and electric' },
];

const CreateRoomModal = ({ onClose, emit }) => {
  const [roomName, setRoomName] = useState('');
  const [selectedBackground, setSelectedBackground] = useState('cosmic');
  const [isCreating, setIsCreating] = useState(false);

  const { user } = useCosmosStore();

  const handleCreate = () => {
    if (!roomName.trim()) return;

    setIsCreating(true);
    emit('room:create', {
      name: roomName.trim(),
      backgroundType: selectedBackground,
    });

    setTimeout(() => {
      setIsCreating(false);
      onClose();
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass rounded-3xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Create Your Room</h2>
            <p className="text-purple-200 text-sm mt-1">You can create one room per account</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="p-6 space-y-6">
          {/* Room Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder={`${user?.name}'s Room`}
              className="w-full px-4 py-3 bg-cosmos-surface/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 transition-all"
              maxLength={30}
            />
          </div>

          {/* Background Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Room Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              {BACKGROUND_OPTIONS.map((bg) => {
                const Icon = bg.icon;
                const isSelected = selectedBackground === bg.id;
                
                return (
                  <motion.button
                    key={bg.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedBackground(bg.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-purple-500/20 bg-cosmos-surface/30 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${bg.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{bg.name}</p>
                        <p className="text-xs text-gray-400">{bg.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div
                        layoutId="selected-bg"
                        className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className={`h-24 rounded-xl room-bg-${selectedBackground} flex items-center justify-center border border-purple-500/30`}>
            <div className="text-center">
              <p className="text-white font-medium">{roomName || `${user?.name}'s Room`}</p>
              <p className="text-xs text-gray-300 mt-1">Preview</p>
            </div>
          </div>

          {/* Create Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            disabled={!roomName.trim() || isCreating}
            className={`w-full py-4 rounded-xl font-display font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
              roomName.trim() && !isCreating
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isCreating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Create Room
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateRoomModal;
