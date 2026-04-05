import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCosmosStore } from '../store';

const MOVE_SPEED = 5;
const CLICK_MOVE_SPEED = 8;
const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 1500;
const LERP_FACTOR = 0.15; // Interpolation smoothness for other users
const CAMERA_LERP = 0.1; // Camera smoothing

// Avatar component rendered on canvas
const Avatar = ({ user, isCurrentUser, onClick, interpolatedPosition }) => {
  const getShapeStyle = () => {
    const style = user.avatar?.style || 'default';
    switch (style) {
      case 'round': return 'rounded-full';
      case 'square': return 'rounded-md';
      case 'hexagon': return 'rounded-xl';
      default: return 'rounded-2xl';
    }
  };

  const color = user.avatar?.color || '#6366f1';
  
  // Use interpolated position for other users, direct position for current user
  const displayPos = isCurrentUser ? user.position : (interpolatedPosition || user.position);

  return (
    <div
      className={`absolute cursor-pointer ${isCurrentUser ? 'z-20' : 'z-10'}`}
      style={{
        left: displayPos?.x - 24,
        top: displayPos?.y - 24,
        transform: user.isSitting ? 'scale(0.9)' : 'scale(1)',
        // No CSS transitions - positions are updated directly
      }}
      onClick={() => !isCurrentUser && onClick?.(user)}
    >
      {/* Proximity ring for current user */}
      {isCurrentUser && (
        <div
          className="absolute -inset-16 rounded-full border-2 border-violet-400/30 proximity-ring"
          style={{ borderColor: `${color}40` }}
        />
      )}
      
      {/* Avatar body */}
      <div
        className={`w-12 h-12 ${getShapeStyle()} flex items-center justify-center shadow-lg ${
          isCurrentUser ? 'ring-2 ring-white' : ''
        }`}
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`,
          boxShadow: `0 0 ${isCurrentUser ? '20px' : '10px'} ${color}50`,
        }}
      >
        {/* Face */}
        <div className="relative w-8 h-8">
          {/* Eyes */}
          <div className="absolute top-1.5 left-1 w-2 h-2 bg-white rounded-full">
            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-gray-800 rounded-full" />
          </div>
          <div className="absolute top-1.5 right-1 w-2 h-2 bg-white rounded-full">
            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-gray-800 rounded-full" />
          </div>
          {/* Mouth */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-1.5 border-b-2 border-white rounded-b-full" />
        </div>
      </div>
      
      {/* Name tag */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <span className="px-2 py-0.5 bg-black/60 rounded-full text-xs text-white font-medium">
          {user.name}
          {isCurrentUser && ' (You)'}
        </span>
      </div>

      {/* Direction indicator */}
      {!user.isSitting && (
        <div
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            top: user.direction === 'up' ? -4 : user.direction === 'down' ? 'auto' : '50%',
            bottom: user.direction === 'down' ? -4 : 'auto',
            left: user.direction === 'left' ? -4 : user.direction === 'right' ? 'auto' : '50%',
            right: user.direction === 'right' ? -4 : 'auto',
            transform: ['up', 'down'].includes(user.direction) ? 'translateX(-50%)' : 'translateY(-50%)',
          }}
        />
      )}
    </div>
  );
};

// Room component
const Room = ({ room, onEnter, isInside }) => {
  const bgClass = `room-bg-${room.backgroundType || 'cosmic'}`;
  
  return (
    <div
      className={`absolute ${bgClass} rounded-2xl border-2 transition-all duration-300 ${
        isInside ? 'border-violet-400 shadow-lg' : 'border-violet-400/30'
      }`}
      style={{
        left: room.x,
        top: room.y,
        width: room.width,
        height: room.height,
      }}
    >
      {/* Room name */}
      <div className="absolute -top-8 left-4 px-3 py-1 bg-cosmos-surface/80 rounded-lg text-sm font-medium text-violet-300">
        {room.name}
        {room.isCustom && (
          <span className="ml-2 text-xs text-gray-400">by {room.ownerName}</span>
        )}
      </div>

      {/* Furniture */}
      {room.furniture?.map((item, idx) => (
        <Furniture key={idx} item={item} roomX={room.x} roomY={room.y} />
      ))}
    </div>
  );
};

// Furniture component
const Furniture = ({ item, roomX, roomY }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'sofa':
        return (
          <div className="w-16 h-8 bg-violet-700/60 rounded-lg border border-violet-500/50 flex items-center justify-center">
            <div className="w-12 h-4 bg-violet-600/80 rounded" />
          </div>
        );
      case 'chair':
        return (
          <div className="w-8 h-8 bg-amber-700/60 rounded-lg border border-amber-500/50" />
        );
      case 'table':
        return (
          <div className="w-12 h-8 bg-amber-800/60 rounded border border-amber-600/50" />
        );
      case 'desk':
        return (
          <div className="w-16 h-10 bg-gray-700/60 rounded border border-gray-500/50" />
        );
      case 'plant':
        return (
          <div className="w-6 h-10 flex flex-col items-center">
            <div className="w-6 h-6 bg-green-600/60 rounded-full" />
            <div className="w-2 h-4 bg-amber-700/60" />
          </div>
        );
      case 'lamp':
        return (
          <div className="w-4 h-10 flex flex-col items-center">
            <div className="w-6 h-4 bg-yellow-400/60 rounded-t-full" />
            <div className="w-1 h-6 bg-gray-600/60" />
          </div>
        );
      case 'cafe_table':
        return (
          <div className="w-8 h-8 bg-amber-600/60 rounded-full border border-amber-400/50" />
        );
      case 'stool':
        return (
          <div className="w-6 h-6 bg-gray-600/60 rounded-full border border-gray-400/50" />
        );
      case 'counter':
        return (
          <div className="w-20 h-6 bg-gray-700/60 rounded border border-gray-500/50" />
        );
      case 'whiteboard':
        return (
          <div className="w-16 h-12 bg-white/80 rounded border-2 border-gray-400/50" />
        );
      default:
        return <div className="w-8 h-8 bg-gray-600/40 rounded" />;
    }
  };

  return (
    <div
      className="absolute furniture-hover cursor-pointer"
      style={{
        left: item.x - roomX,
        top: item.y - roomY,
        transform: `rotate(${item.rotation || 0}deg)`,
      }}
    >
      {getIcon()}
    </div>
  );
};

// Click indicator component
const ClickIndicator = ({ position }) => {
  if (!position) return null;
  
  return (
    <div
      className="absolute pointer-events-none z-30"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="w-6 h-6 rounded-full border-2 border-violet-400 animate-ping opacity-75" />
      <div className="absolute inset-0 w-6 h-6 rounded-full border-2 border-violet-400" />
    </div>
  );
};

const CosmosCanvas = ({ emit, socket }) => {
  const containerRef = useRef(null);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [clickTarget, setClickTarget] = useState(null);
  const [clickIndicator, setClickIndicator] = useState(null);
  
  const keysPressed = useRef({});
  const cameraRef = useRef({ x: 0, y: 0 });
  const interpolatedPositions = useRef({});
  const animationFrameRef = useRef(null);
  const lastEmitTime = useRef(0);
  
  const { user, users, rooms, setCurrentRoom } = useCosmosStore();

  // Handle keyboard movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
        keysPressed.current[e.key.toLowerCase()] = true;
        // Cancel click-to-move when using keyboard
        setClickTarget(null);
        setClickIndicator(null);
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle canvas click for click-to-move
  const handleCanvasClick = useCallback((e) => {
    if (!user || !containerRef.current) return;
    
    // Ignore clicks on avatars or UI elements
    if (e.target.closest('.cursor-pointer') && !e.target.closest('.canvas-clickable')) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + camera.x;
    const clickY = e.clientY - rect.top + camera.y;
    
    // Clamp to canvas bounds
    const targetX = Math.max(50, Math.min(CANVAS_WIDTH - 50, clickX));
    const targetY = Math.max(50, Math.min(CANVAS_HEIGHT - 50, clickY));
    
    setClickTarget({ x: targetX, y: targetY });
    setClickIndicator({ x: targetX, y: targetY });
    
    // Hide indicator after animation
    setTimeout(() => setClickIndicator(null), 600);
  }, [user, camera]);

  // Main game loop using requestAnimationFrame for smooth updates
  useEffect(() => {
    if (!user) return;

    const gameLoop = () => {
      const keys = keysPressed.current;
      let dx = 0;
      let dy = 0;
      let direction = null;
      let moved = false;

      // Keyboard movement
      if (keys['arrowup'] || keys['w']) { dy -= MOVE_SPEED; direction = 'up'; }
      if (keys['arrowdown'] || keys['s']) { dy += MOVE_SPEED; direction = 'down'; }
      if (keys['arrowleft'] || keys['a']) { dx -= MOVE_SPEED; direction = 'left'; }
      if (keys['arrowright'] || keys['d']) { dx += MOVE_SPEED; direction = 'right'; }

      // Click-to-move
      if (clickTarget && dx === 0 && dy === 0) {
        const currentX = user.position.x;
        const currentY = user.position.y;
        const distX = clickTarget.x - currentX;
        const distY = clickTarget.y - currentY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        if (distance > CLICK_MOVE_SPEED) {
          // Normalize and apply speed
          dx = (distX / distance) * CLICK_MOVE_SPEED;
          dy = (distY / distance) * CLICK_MOVE_SPEED;
          
          // Determine direction based on dominant axis
          if (Math.abs(distX) > Math.abs(distY)) {
            direction = distX > 0 ? 'right' : 'left';
          } else {
            direction = distY > 0 ? 'down' : 'up';
          }
        } else {
          // Close enough, stop moving
          setClickTarget(null);
        }
      }

      if (dx !== 0 || dy !== 0) {
        const newX = Math.max(50, Math.min(CANVAS_WIDTH - 50, user.position.x + dx));
        const newY = Math.max(50, Math.min(CANVAS_HEIGHT - 50, user.position.y + dy));

        // Update local position immediately
        useCosmosStore.setState((state) => ({
          user: {
            ...state.user,
            position: { x: newX, y: newY },
            direction: direction || state.user.direction,
          },
        }));

        moved = true;

        // Throttle network updates to ~30fps to reduce bandwidth while keeping local movement smooth
        const now = Date.now();
        if (now - lastEmitTime.current > 33) {
          emit('user:move', {
            position: { x: newX, y: newY },
            direction: direction || user.direction,
          });
          lastEmitTime.current = now;
        }

        // Check if inside a room
        const currentRoom = rooms.find(
          (room) =>
            newX >= room.x &&
            newX <= room.x + room.width &&
            newY >= room.y &&
            newY <= room.y + room.height
        );

        if (currentRoom) {
          setCurrentRoom(currentRoom.id);
          emit('room:enter', { roomId: currentRoom.id });
        } else {
          setCurrentRoom(null);
        }
      }

      // Interpolate other users' positions for smooth movement
      users.forEach((otherUser) => {
        const id = otherUser.odestined;
        const targetPos = otherUser.position;
        
        if (!interpolatedPositions.current[id]) {
          interpolatedPositions.current[id] = { ...targetPos };
        } else {
          const current = interpolatedPositions.current[id];
          current.x += (targetPos.x - current.x) * LERP_FACTOR;
          current.y += (targetPos.y - current.y) * LERP_FACTOR;
        }
      });

      // Smooth camera follow
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const targetCamX = user.position.x - containerWidth / 2;
        const targetCamY = user.position.y - containerHeight / 2;

        const clampedTargetX = Math.max(0, Math.min(CANVAS_WIDTH - containerWidth, targetCamX));
        const clampedTargetY = Math.max(0, Math.min(CANVAS_HEIGHT - containerHeight, targetCamY));

        // Smooth camera interpolation
        cameraRef.current.x += (clampedTargetX - cameraRef.current.x) * CAMERA_LERP;
        cameraRef.current.y += (clampedTargetY - cameraRef.current.y) * CAMERA_LERP;

        setCamera({
          x: Math.round(cameraRef.current.x),
          y: Math.round(cameraRef.current.y),
        });
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [user, users, emit, rooms, setCurrentRoom, clickTarget]);

  const handleUserClick = useCallback((clickedUser) => {
    setSelectedUser(clickedUser);
  }, []);

  const handleStartCall = (type) => {
    if (!selectedUser) return;
    
    useCosmosStore.setState({
      activeCall: {
        type,
        targetUserId: selectedUser.odestined,
        targetUserName: selectedUser.name,
        isOutgoing: true,
      },
    });
    
    setSelectedUser(null);
  };

  const handleBlockUser = () => {
    if (!selectedUser) return;
    emit('user:block', { targetUserId: selectedUser.odestined });
    setSelectedUser(null);
  };

  const handleVoteKick = () => {
    if (!selectedUser) return;
    emit('vote:kick', { targetUserId: selectedUser.odestined });
    setSelectedUser(null);
  };

  if (!user) return null;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden relative bg-cosmos-bg canvas-clickable"
      onClick={handleCanvasClick}
    >
      {/* Canvas world */}
      <div
        className="absolute"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `translate(${-camera.x}px, ${-camera.y}px)`,
          // No CSS transition - camera is updated via interpolation
        }}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Stars */}
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${(i * 37) % CANVAS_WIDTH}px`,
              top: `${(i * 23) % CANVAS_HEIGHT}px`,
            }}
          />
        ))}

        {/* Click indicator */}
        <ClickIndicator position={clickIndicator} />

        {/* Rooms */}
        {rooms.map((room) => (
          <Room
            key={room.id}
            room={room}
            isInside={user.position && 
              user.position.x >= room.x && 
              user.position.x <= room.x + room.width &&
              user.position.y >= room.y && 
              user.position.y <= room.y + room.height
            }
          />
        ))}

        {/* Other users */}
        {users.map((otherUser) => (
          <Avatar
            key={otherUser.odestined}
            user={otherUser}
            isCurrentUser={false}
            onClick={handleUserClick}
            interpolatedPosition={interpolatedPositions.current[otherUser.odestined]}
          />
        ))}

        {/* Current user */}
        <Avatar user={user} isCurrentUser={true} />
      </div>

      {/* User context menu */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => e.stopPropagation()}>
          <div className="glass rounded-2xl p-6 w-80">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${selectedUser.avatar?.color || '#6366f1'} 0%, ${selectedUser.avatar?.color || '#6366f1'}bb 100%)`,
                }}
              >
                <div className="w-8 h-8 relative">
                  <div className="absolute top-1.5 left-1 w-2 h-2 bg-white rounded-full" />
                  <div className="absolute top-1.5 right-1 w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white">{selectedUser.name}</h3>
                <p className="text-sm text-gray-400">Click an action below</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleStartCall('voice')}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Voice Call
              </button>

              <button
                onClick={() => handleStartCall('video')}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video Call
              </button>

              <button
                onClick={handleBlockUser}
                className="w-full py-2 px-4 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-red-400 font-medium flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Block User
              </button>

              <button
                onClick={handleVoteKick}
                className="w-full py-2 px-4 bg-orange-600/20 hover:bg-orange-600/40 rounded-lg text-orange-400 font-medium flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Vote to Kick
              </button>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full mt-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 glass px-4 py-2 rounded-lg text-sm text-gray-400">
        <kbd className="px-1.5 py-0.5 bg-violet-600/30 rounded text-violet-300">Arrow Keys</kbd> or{' '}
        <kbd className="px-1.5 py-0.5 bg-violet-600/30 rounded text-violet-300">WASD</kbd> to move •{' '}
        <kbd className="px-1.5 py-0.5 bg-violet-600/30 rounded text-violet-300">Click</kbd> to walk to location
      </div>
    </div>
  );
};

export default CosmosCanvas;