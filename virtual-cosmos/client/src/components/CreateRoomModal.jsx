import React, { useState } from 'react';
import { useCosmosStore } from '../store';

const CreateRoomModal = ({ onClose, emit }) => {
  const [roomName, setRoomName] = useState('');
  const [selectedBackground, setSelectedBackground] = useState('cosmic');
  const [isCreating, setIsCreating] = useState(false);

  const { backgroundTypes } = useCosmosStore();

  const backgrounds = backgroundTypes.length > 0 
    ? backgroundTypes 
    : ['cozy', 'professional', 'warm', 'cosmic', 'nature', 'minimal', 'retro', 'neon'];

  const handleCreate = () => {
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }

    setIsCreating(true);

    emit('room:create', {
      name: roomName.trim(),
      backgroundType: selectedBackground,
    });

    // Close after a short delay (assuming success)
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const getBackgroundPreview = (type) => {
    const colors = {
      cozy: ['#2d1b4e', '#1a1a3a'],
      professional: ['#1e3a5f', '#0f2942'],
      warm: ['#4a2c2a', '#2d1a1a'],
      cosmic: ['#1a0a2e', '#0a0a1a'],
      nature: ['#1a3a2d', '#0f2a1f'],
      minimal: ['#2a2a2a', '#1a1a1a'],
      retro: ['#4a3a2a', '#2a2a1a'],
      neon: ['#0a1a2e', '#1a0a3a'],
    };
    return colors[type] || colors.cosmic;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="glass rounded-2xl p-6 w-96 max-w-[90vw]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create Room</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Room Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Room Name
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="My awesome room"
            maxLength={30}
            className="w-full px-4 py-3 bg-cosmos-surface border border-violet-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <p className="mt-1 text-xs text-gray-500">{roomName.length}/30 characters</p>
        </div>

        {/* Background Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Background Theme
          </label>
          <div className="grid grid-cols-4 gap-2">
            {backgrounds.map((type) => {
              const [color1, color2] = getBackgroundPreview(type);
              return (
                <button
                  key={type}
                  onClick={() => setSelectedBackground(type)}
                  className={`aspect-square rounded-xl transition-all ${
                    selectedBackground === type 
                      ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-cosmos-bg scale-105' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
                  }}
                  title={type.charAt(0).toUpperCase() + type.slice(1)}
                />
              );
            })}
          </div>
          <p className="mt-2 text-sm text-gray-400 text-center capitalize">
            {selectedBackground}
          </p>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Preview
          </label>
          <div
            className="w-full h-24 rounded-xl border border-violet-500/30 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${getBackgroundPreview(selectedBackground)[0]} 0%, ${getBackgroundPreview(selectedBackground)[1]} 100%)`,
            }}
          >
            <span className="text-white font-medium px-3 py-1 bg-black/30 rounded-lg">
              {roomName || 'Room Name'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !roomName.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl font-medium text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </span>
            ) : (
              'Create Room'
            )}
          </button>
        </div>

        {/* Info */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          You can only create one room. Rooms include random furniture.
        </p>
      </div>
    </div>
  );
};

export default CreateRoomModal;
