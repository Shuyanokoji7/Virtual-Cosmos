import { create } from 'zustand';

export const useCosmosStore = create((set, get) => ({
  // User state
  user: null,
  isJoined: false,
  
  // Other users
  users: [],
  
  // Rooms
  rooms: [],
  backgroundTypes: [],
  currentRoom: null,
  
  // Proximity connections
  proximityUsers: [],
  
  // Chat state
  messages: {},
  unreadCounts: {},
  activeChatRoom: null,
  isGlobalChatOpen: false,
  
  // Blocked users
  blockedUsers: new Set(),
  
  // Video/Voice call state
  activeCall: null,
  localStream: null,
  remoteStreams: {},
  
  // Vote kicks
  voteKicks: {},
  
  // Sitting state
  sittingOn: null,
  
  // Actions
  setUser: (user) => set({ user, isJoined: true }),
  
  setUsers: (users) => set({ users }),
  
  addUser: (user) => set((state) => ({
    users: [...state.users.filter(u => u.odestined !== user.odestined), user],
  })),
  
  removeUser: (odestined) => set((state) => ({
    users: state.users.filter(u => u.odestined !== odestined),
    proximityUsers: state.proximityUsers.filter(u => u.odestined !== odestined),
  })),
  
  updateUserPosition: (odestined, position, direction, isSitting) => set((state) => ({
    users: state.users.map(u => 
      u.odestined === odestined 
        ? { ...u, position, direction, isSitting: isSitting ?? u.isSitting }
        : u
    ),
  })),
  
  setRooms: (rooms) => set({ rooms }),
  
  addRoom: (room) => set((state) => ({
    rooms: [...state.rooms, room],
  })),
  
  setBackgroundTypes: (types) => set({ backgroundTypes: types }),
  
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  // Proximity
  addProximityUser: (user, chatRoomId) => set((state) => ({
    proximityUsers: [...state.proximityUsers.filter(u => u.odestined !== user.odestined), { ...user, chatRoomId }],
    activeChatRoom: chatRoomId,
  })),
  
  removeProximityUser: (odestined) => set((state) => {
    const newProximityUsers = state.proximityUsers.filter(u => u.odestined !== odestined);
    return {
      proximityUsers: newProximityUsers,
      activeChatRoom: newProximityUsers.length > 0 ? newProximityUsers[0].chatRoomId : null,
    };
  }),
  
  // Messages
  addMessage: (roomId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: [...(state.messages[roomId] || []), message],
    },
  })),
  
  setMessages: (roomId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: messages,
    },
  })),
  
  setUnreadCount: (roomId, count) => set((state) => ({
    unreadCounts: {
      ...state.unreadCounts,
      [roomId]: count,
    },
  })),
  
  clearUnread: (roomId) => set((state) => ({
    unreadCounts: {
      ...state.unreadCounts,
      [roomId]: 0,
    },
  })),
  
  setActiveChatRoom: (roomId) => set({ activeChatRoom: roomId }),
  
  toggleGlobalChat: () => set((state) => ({ isGlobalChatOpen: !state.isGlobalChatOpen })),
  
  setGlobalChatOpen: (isOpen) => set({ isGlobalChatOpen: isOpen }),
  
  // Blocking
  blockUser: (odestined) => set((state) => {
    const newBlocked = new Set(state.blockedUsers);
    newBlocked.add(odestined);
    return { blockedUsers: newBlocked };
  }),
  
  unblockUser: (odestined) => set((state) => {
    const newBlocked = new Set(state.blockedUsers);
    newBlocked.delete(odestined);
    return { blockedUsers: newBlocked };
  }),
  
  isUserBlocked: (odestined) => get().blockedUsers.has(odestined),
  
  // Video/Voice
  setActiveCall: (call) => set({ activeCall: call }),
  
  setLocalStream: (stream) => set({ localStream: stream }),
  
  addRemoteStream: (odestined, stream) => set((state) => ({
    remoteStreams: { ...state.remoteStreams, [odestined]: stream },
  })),
  
  removeRemoteStream: (odestined) => set((state) => {
    const { [odestined]: removed, ...rest } = state.remoteStreams;
    return { remoteStreams: rest };
  }),
  
  clearCall: () => set({
    activeCall: null,
    localStream: null,
    remoteStreams: {},
  }),
  
  // Vote kicks
  updateVoteKick: (targetUserId, voteCount, threshold, voters) => set((state) => ({
    voteKicks: {
      ...state.voteKicks,
      [targetUserId]: { voteCount, threshold, voters },
    },
  })),
  
  // Sitting
  setSittingOn: (furnitureId) => set({ sittingOn: furnitureId }),
}));
