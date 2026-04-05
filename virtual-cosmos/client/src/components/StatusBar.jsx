import React, { useState } from 'react';
import { useCosmosStore } from '../store';

const StatusBar = ({ onCreateRoom, emit }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  
  const { 
    user, 
    users, 
    toggleGlobalChat, 
    isGlobalChatOpen,
    unreadCounts,
    blockedUsers,
    voteKicks,
  } = useCosmosStore();

  const globalUnread = unreadCounts['global'] || 0;
  const onlineCount = users.length + 1; // +1 for current user

  const handleUnblockUser = (userId) => {
    emit('user:unblock', { targetUserId: userId });
    useCosmosStore.getState().unblockUser(userId);
  };

  const getBlockedUsersList = () => {
    const blocked = Array.from(blockedUsers);
    return blocked.map((userId) => {
      const blockedUser = users.find((u) => u.odestined === userId);
      return {
        odestined: userId,
        name: blockedUser?.name || 'Unknown User',
      };
    });
  };

  return (
    <>
      {/* Top Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-14 glass-chat border-b border-cyan-500/20 flex items-center justify-between px-4 z-30">
        {/* Left: Logo & User Count */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-white hidden sm:block">Virtual Cosmos</span>
          </div>
          
          <div className="h-6 w-px bg-gray-600" />
          
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-300">
              <span className="font-semibold text-white">{onlineCount}</span> online
            </span>
          </div>
        </div>

        {/* Center: Current User Info */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${user?.avatar?.color || '#6366f1'} 0%, ${user?.avatar?.color || '#6366f1'}bb 100%)`,
            }}
          >
            <div className="w-5 h-5 relative">
              <div className="absolute top-1 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
              <div className="absolute top-1 right-0.5 w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>
          <span className="font-medium text-white">{user?.name}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Global Chat Toggle */}
          <button
            onClick={toggleGlobalChat}
            className={`relative p-2 rounded-lg transition-colors ${
              isGlobalChatOpen 
                ? 'bg-cyan-600 text-white' 
                : 'bg-cosmos-surface text-gray-400 hover:text-white hover:bg-cosmos-surface/80'
            }`}
            title="Global Chat"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {globalUnread > 0 && (
              <span className="notification-badge">{globalUnread > 99 ? '99+' : globalUnread}</span>
            )}
          </button>

          {/* Create Room */}
          <button
            onClick={onCreateRoom}
            className="p-2 rounded-lg bg-cosmos-surface text-gray-400 hover:text-white hover:bg-cosmos-surface/80 transition-colors"
            title="Create Room"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-cosmos-surface text-gray-400 hover:text-white hover:bg-cosmos-surface/80 transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Vote Kick Notifications */}
      {Object.entries(voteKicks).length > 0 && (
        <div className="absolute top-16 right-4 z-30 space-y-2">
          {Object.entries(voteKicks).map(([targetId, data]) => {
            const targetUser = users.find((u) => u.odestined === targetId);
            if (!targetUser) return null;
            
            return (
              <div key={targetId} className="glass px-4 py-2 rounded-lg text-sm">
                <p className="text-orange-400">
                  Vote kick: <span className="font-semibold text-white">{targetUser.name}</span>
                </p>
                <p className="text-gray-400">
                  {data.voteCount} / {data.threshold} votes
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="glass rounded-2xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Profile</h3>
              <div className="flex items-center gap-4 p-4 bg-cosmos-surface rounded-xl">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${user?.avatar?.color || '#6366f1'} 0%, ${user?.avatar?.color || '#6366f1'}bb 100%)`,
                  }}
                >
                  <div className="w-8 h-8 relative">
                    <div className="absolute top-1.5 left-1 w-2 h-2 bg-white rounded-full" />
                    <div className="absolute top-1.5 right-1 w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-white">{user?.name}</p>
                  <p className="text-sm text-gray-400">Connected</p>
                </div>
              </div>
            </div>

            {/* Blocked Users */}
            <div className="mb-6">
              <button
                onClick={() => setShowBlockedUsers(!showBlockedUsers)}
                className="w-full flex items-center justify-between p-4 bg-cosmos-surface rounded-xl hover:bg-cosmos-surface/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span className="text-white">Blocked Users</span>
                </div>
                <span className="text-gray-400">{blockedUsers.size}</span>
              </button>
              
              {showBlockedUsers && (
                <div className="mt-2 p-4 bg-cosmos-surface/50 rounded-xl space-y-2">
                  {getBlockedUsersList().length === 0 ? (
                    <p className="text-gray-400 text-sm text-center">No blocked users</p>
                  ) : (
                    getBlockedUsersList().map((blockedUser) => (
                      <div key={blockedUser.odestined} className="flex items-center justify-between">
                        <span className="text-white">{blockedUser.name}</span>
                        <button
                          onClick={() => handleUnblockUser(blockedUser.odestined)}
                          className="text-sm text-cyan-400 hover:text-cyan-300"
                        >
                          Unblock
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Controls Help */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Controls</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-3 bg-cosmos-surface rounded-lg">
                  <span className="text-gray-300">Move</span>
                  <span className="text-gray-400">Arrow Keys / WASD</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-cosmos-surface rounded-lg">
                  <span className="text-gray-300">Chat</span>
                  <span className="text-gray-400">Get close to others</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-cosmos-surface rounded-lg">
                  <span className="text-gray-300">Call</span>
                  <span className="text-gray-400">Click on user</span>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="text-center text-sm text-gray-500">
              <p>Virtual Cosmos v1.0</p>
              <p className="mt-1">A social metaverse experience</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusBar;
