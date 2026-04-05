import React, { useState } from 'react';
import { useCosmosStore } from '../store';
import { AvatarPreview3D } from './Avatar3D';

const UserList = ({ emit, socket }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { users, user, blockedUsers, proximityUsers } = useCosmosStore();

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isNearby = (userId) => {
    return proximityUsers.some((p) => p.odestined === userId);
  };

  const isBlocked = (userId) => {
    return blockedUsers.has(userId);
  };

  const handleStartCall = (targetUser, type) => {
    useCosmosStore.setState({
      activeCall: {
        type,
        targetUserId: targetUser.odestined,
        targetUserName: targetUser.name,
        isOutgoing: true,
      },
    });
  };

  return (
    <div className={`absolute top-16 right-4 z-30 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-12'}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -left-10 top-2 w-8 h-8 glass rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
      >
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-b border-violet-500/20">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Online Users</h3>
              <span className="px-2 py-0.5 bg-violet-600/30 rounded-full text-xs text-violet-300">
                {users.length + 1}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-violet-500/10">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2 bg-cosmos-surface border border-violet-500/30 rounded-lg text-white text-sm placeholder-gray-400"
              />
            </div>
          </div>

          {/* User List */}
          <div className="max-h-80 overflow-y-auto">
            {/* Current User */}
            {user && (
              <div className="px-4 py-3 border-b border-violet-500/10 bg-violet-600/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-xl overflow-hidden"
                      style={{
                        boxShadow: `0 0 10px ${user.avatar?.color || '#6366f1'}50`,
                      }}
                    >
                      <AvatarPreview3D 
                        characterId={user.avatar?.characterId || 'male-a'}
                        color={user.avatar?.color || '#6366f1'}
                        size={40}
                        autoRotate={false}
                      />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-cosmos-bg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-violet-300">You</p>
                  </div>
                </div>
              </div>
            )}

            {/* Other Users */}
            {filteredUsers.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                {searchQuery ? 'No users found' : 'No other users online'}
              </div>
            ) : (
              filteredUsers.map((otherUser) => (
                <div
                  key={otherUser.odestined}
                  className={`px-4 py-3 border-b border-violet-500/10 hover:bg-violet-600/10 transition-colors ${
                    isBlocked(otherUser.odestined) ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-xl overflow-hidden"
                        style={{
                          boxShadow: `0 0 8px ${otherUser.avatar?.color || '#6366f1'}40`,
                        }}
                      >
                        <AvatarPreview3D 
                          characterId={otherUser.avatar?.characterId || 'male-a'}
                          color={otherUser.avatar?.color || '#6366f1'}
                          size={40}
                          autoRotate={false}
                        />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-cosmos-bg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{otherUser.name}</p>
                      <p className="text-xs text-gray-400">
                        {isBlocked(otherUser.odestined) ? (
                          <span className="text-red-400">Blocked</span>
                        ) : isNearby(otherUser.odestined) ? (
                          <span className="text-green-400">Nearby</span>
                        ) : otherUser.isSitting ? (
                          'Sitting'
                        ) : (
                          'Online'
                        )}
                      </p>
                    </div>
                    
                    {/* Quick Actions */}
                    {!isBlocked(otherUser.odestined) && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStartCall(otherUser, 'voice')}
                          className="p-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/40 text-green-400 transition-colors"
                          title="Voice Call"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleStartCall(otherUser, 'video')}
                          className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition-colors"
                          title="Video Call"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
