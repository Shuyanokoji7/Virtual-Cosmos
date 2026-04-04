import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as PIXI from 'pixi.js';

const PROXIMITY_RADIUS = 150;
const MOVE_SPEED = 3;
const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1600;
const GRID_SIZE = 60;

// Tile colors for the floor pattern
const TILE_COLORS = [0x0d1225, 0x0f1529];

export default function CosmosCanvas({ myData, otherUsers, activeConnections, onMove }) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const worldRef = useRef(null);
  const myAvatarRef = useRef(null);
  const otherAvatarsRef = useRef(new Map());
  const keysRef = useRef(new Set());
  const posRef = useRef({ x: 0, y: 0 });
  const connectionLinesRef = useRef(new PIXI.Graphics());
  const proximityRingRef = useRef(null);
  const [minimap, setMinimap] = useState({ x: 0, y: 0 });

  // Create avatar graphics
  const createAvatar = useCallback((username, color, isSelf = false) => {
    const container = new PIXI.Container();

    // Shadow
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.2);
    shadow.drawEllipse(0, 22, 18, 6);
    shadow.endFill();
    container.addChild(shadow);

    // Body circle
    const body = new PIXI.Graphics();
    const colorNum = parseInt(color.replace('#', ''), 16);
    body.beginFill(colorNum);
    body.drawCircle(0, 0, 20);
    body.endFill();

    // Inner highlight
    body.beginFill(0xffffff, 0.15);
    body.drawCircle(-5, -5, 10);
    body.endFill();

    container.addChild(body);

    // Eyes
    const eyeL = new PIXI.Graphics();
    eyeL.beginFill(0xffffff);
    eyeL.drawCircle(-7, -4, 5);
    eyeL.endFill();
    eyeL.beginFill(0x222222);
    eyeL.drawCircle(-6, -3, 2.5);
    eyeL.endFill();
    container.addChild(eyeL);

    const eyeR = new PIXI.Graphics();
    eyeR.beginFill(0xffffff);
    eyeR.drawCircle(7, -4, 5);
    eyeR.endFill();
    eyeR.beginFill(0x222222);
    eyeR.drawCircle(8, -3, 2.5);
    eyeR.endFill();
    container.addChild(eyeR);

    // Mouth
    const mouth = new PIXI.Graphics();
    mouth.lineStyle(1.5, 0x222222);
    mouth.arc(0, 4, 5, 0, Math.PI);
    container.addChild(mouth);

    // Name label
    const nameTag = new PIXI.Text(isSelf ? `${username} (you)` : username, {
      fontFamily: 'IBM Plex Sans, sans-serif',
      fontSize: 11,
      fontWeight: '600',
      fill: 0xffffff,
      align: 'center',
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowDistance: 1,
      dropShadowBlur: 3,
    });
    nameTag.anchor.set(0.5, 0);
    nameTag.y = 28;
    container.addChild(nameTag);

    // Background for name
    const nameBg = new PIXI.Graphics();
    nameBg.beginFill(isSelf ? 0x6c5ce7 : 0x1a1f35, 0.85);
    nameBg.drawRoundedRect(
      -nameTag.width / 2 - 6,
      26,
      nameTag.width + 12,
      18,
      6
    );
    nameBg.endFill();
    container.addChildAt(nameBg, container.children.length - 1);

    return container;
  }, []);

  // Initialize PixiJS
  useEffect(() => {
    if (!containerRef.current || !myData) return;

    const app = new PIXI.Application({
      resizeTo: containerRef.current,
      backgroundColor: 0x080c18,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    containerRef.current.appendChild(app.view);
    appRef.current = app;

    // World container
    const world = new PIXI.Container();
    worldRef.current = world;
    app.stage.addChild(world);

    // Draw floor tiles
    const floor = new PIXI.Graphics();
    for (let x = 0; x < WORLD_WIDTH; x += GRID_SIZE) {
      for (let y = 0; y < WORLD_HEIGHT; y += GRID_SIZE) {
        const idx = (Math.floor(x / GRID_SIZE) + Math.floor(y / GRID_SIZE)) % 2;
        floor.beginFill(TILE_COLORS[idx]);
        floor.drawRect(x, y, GRID_SIZE, GRID_SIZE);
        floor.endFill();
      }
    }
    // Grid lines
    floor.lineStyle(1, 0x1a2040, 0.3);
    for (let x = 0; x <= WORLD_WIDTH; x += GRID_SIZE) {
      floor.moveTo(x, 0);
      floor.lineTo(x, WORLD_HEIGHT);
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += GRID_SIZE) {
      floor.moveTo(0, y);
      floor.lineTo(WORLD_WIDTH, y);
    }
    world.addChild(floor);

    // World border
    const border = new PIXI.Graphics();
    border.lineStyle(2, 0x6c5ce7, 0.3);
    border.drawRoundedRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 12);
    world.addChild(border);

    // Decorative elements - rooms/zones
    const zones = [
      { x: 100, y: 100, w: 400, h: 300, label: 'Lounge', color: 0x6c5ce7 },
      { x: 600, y: 100, w: 350, h: 250, label: 'Meeting Room', color: 0x00cec9 },
      { x: 1100, y: 100, w: 300, h: 300, label: 'Creative Space', color: 0xfdcb6e },
      { x: 100, y: 500, w: 350, h: 300, label: 'Cafe', color: 0xff7675 },
      { x: 550, y: 450, w: 500, h: 350, label: 'Open Area', color: 0xa29bfe },
      { x: 1150, y: 500, w: 350, h: 280, label: 'Library', color: 0x55a3e8 },
      { x: 100, y: 900, w: 300, h: 250, label: 'Garden', color: 0x00b894 },
      { x: 500, y: 900, w: 400, h: 300, label: 'Workshop', color: 0xe17055 },
      { x: 1000, y: 900, w: 350, h: 280, label: 'Arcade', color: 0xd63031 },
    ];

    zones.forEach((z) => {
      const zone = new PIXI.Graphics();
      zone.beginFill(z.color, 0.04);
      zone.lineStyle(1, z.color, 0.15);
      zone.drawRoundedRect(z.x, z.y, z.w, z.h, 10);
      zone.endFill();
      world.addChild(zone);

      const label = new PIXI.Text(z.label, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: 14,
        fill: z.color,
        fontWeight: '500',
        alpha: 0.5,
      });
      label.x = z.x + 12;
      label.y = z.y + 8;
      label.alpha = 0.4;
      world.addChild(label);
    });

    // Furniture dots (decorative)
    const decorations = [
      { x: 200, y: 200, r: 15, color: 0x2d3436 },
      { x: 350, y: 250, r: 20, color: 0x2d3436 },
      { x: 750, y: 200, r: 12, color: 0x2d3436 },
      { x: 1250, y: 250, r: 18, color: 0x2d3436 },
      { x: 200, y: 650, r: 10, color: 0x2d3436 },
      { x: 300, y: 600, r: 10, color: 0x2d3436 },
    ];
    decorations.forEach((d) => {
      const deco = new PIXI.Graphics();
      deco.beginFill(d.color, 0.5);
      deco.drawCircle(d.x, d.y, d.r);
      deco.endFill();
      world.addChild(deco);
    });

    // Connection lines layer
    world.addChild(connectionLinesRef.current);

    // Proximity ring for self
    const ring = new PIXI.Graphics();
    proximityRingRef.current = ring;
    world.addChild(ring);

    // Create my avatar
    const myAvatar = createAvatar(myData.username, myData.avatarColor, true);
    myAvatar.x = myData.x;
    myAvatar.y = myData.y;
    posRef.current = { x: myData.x, y: myData.y };
    myAvatarRef.current = myAvatar;
    world.addChild(myAvatar);

    // Game loop
    const ticker = app.ticker;
    let frameCount = 0;

    ticker.add(() => {
      const keys = keysRef.current;
      let dx = 0, dy = 0;

      if (keys.has('w') || keys.has('arrowup')) dy -= MOVE_SPEED;
      if (keys.has('s') || keys.has('arrowdown')) dy += MOVE_SPEED;
      if (keys.has('a') || keys.has('arrowleft')) dx -= MOVE_SPEED;
      if (keys.has('d') || keys.has('arrowright')) dx += MOVE_SPEED;

      // Diagonal normalization
      if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
      }

      if (dx !== 0 || dy !== 0) {
        let newX = posRef.current.x + dx;
        let newY = posRef.current.y + dy;

        // Clamp to world bounds
        newX = Math.max(25, Math.min(WORLD_WIDTH - 25, newX));
        newY = Math.max(25, Math.min(WORLD_HEIGHT - 25, newY));

        posRef.current.x = newX;
        posRef.current.y = newY;

        if (myAvatarRef.current) {
          myAvatarRef.current.x = newX;
          myAvatarRef.current.y = newY;
        }

        // Send position every 2 frames
        frameCount++;
        if (frameCount % 2 === 0) {
          onMove(newX, newY);
        }
      }

      // Camera follow
      if (app.screen) {
        world.x = -posRef.current.x + app.screen.width / 2;
        world.y = -posRef.current.y + app.screen.height / 2;

        // Clamp camera
        world.x = Math.min(0, Math.max(world.x, -WORLD_WIDTH + app.screen.width));
        world.y = Math.min(0, Math.max(world.y, -WORLD_HEIGHT + app.screen.height));
      }

      // Draw proximity ring
      if (proximityRingRef.current) {
        const ring = proximityRingRef.current;
        ring.clear();
        ring.lineStyle(1.5, 0x6c5ce7, 0.2);
        ring.drawCircle(posRef.current.x, posRef.current.y, PROXIMITY_RADIUS);

        // Dashed inner ring
        ring.lineStyle(1, 0xa29bfe, 0.08);
        ring.drawCircle(posRef.current.x, posRef.current.y, PROXIMITY_RADIUS * 0.7);
      }

      // Draw connection lines
      const lines = connectionLinesRef.current;
      lines.clear();
      otherAvatarsRef.current.forEach((avatar, sid) => {
        const dist = Math.sqrt(
          (posRef.current.x - avatar.x) ** 2 + (posRef.current.y - avatar.y) ** 2
        );
        if (dist < PROXIMITY_RADIUS) {
          const alpha = 1 - dist / PROXIMITY_RADIUS;
          lines.lineStyle(2, 0x6c5ce7, alpha * 0.5);
          lines.moveTo(posRef.current.x, posRef.current.y);
          lines.lineTo(avatar.x, avatar.y);

          // Glow midpoint
          const mx = (posRef.current.x + avatar.x) / 2;
          const my = (posRef.current.y + avatar.y) / 2;
          lines.beginFill(0xa29bfe, alpha * 0.3);
          lines.drawCircle(mx, my, 4);
          lines.endFill();
        }
      });

      // Update minimap
      setMinimap({
        x: (posRef.current.x / WORLD_WIDTH) * 100,
        y: (posRef.current.y / WORLD_HEIGHT) * 100,
      });
    });

    // Resize handler
    const handleResize = () => app.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ticker.destroy();
      app.destroy(true, { children: true });
    };
  }, [myData, createAvatar, onMove]);

  // Sync other users' avatars
  useEffect(() => {
    if (!worldRef.current || !myData) return;

    const currentIds = new Set(otherUsers.map((u) => u.socketId));

    // Remove avatars for users who left
    otherAvatarsRef.current.forEach((avatar, sid) => {
      if (!currentIds.has(sid)) {
        worldRef.current.removeChild(avatar);
        otherAvatarsRef.current.delete(sid);
      }
    });

    // Add/update avatars
    otherUsers.forEach((user) => {
      let avatar = otherAvatarsRef.current.get(user.socketId);
      if (!avatar) {
        avatar = createAvatar(user.username, user.avatarColor, false);
        avatar.x = user.x;
        avatar.y = user.y;
        worldRef.current.addChild(avatar);
        otherAvatarsRef.current.set(user.socketId, avatar);
      } else {
        // Smooth interpolation
        avatar.x += (user.x - avatar.x) * 0.2;
        avatar.y += (user.y - avatar.y) * 0.2;
      }
    });
  }, [otherUsers, myData, createAvatar]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't capture if user is typing in chat
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      keysRef.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />

      {/* Minimap */}
      <div className="absolute bottom-4 left-4 w-36 h-24 bg-cosmos-surface/80 backdrop-blur-md border border-cosmos-border rounded-xl overflow-hidden shadow-lg">
        <div className="relative w-full h-full">
          {/* Mini zones */}
          <div className="absolute inset-1 opacity-30">
            <div className="absolute bg-purple-500/30 rounded-sm" style={{ left: '4%', top: '6%', width: '17%', height: '19%' }} />
            <div className="absolute bg-teal-500/30 rounded-sm" style={{ left: '25%', top: '6%', width: '15%', height: '16%' }} />
            <div className="absolute bg-yellow-500/30 rounded-sm" style={{ left: '46%', top: '6%', width: '12%', height: '19%' }} />
          </div>

          {/* My position dot */}
          <div
            className="absolute w-2 h-2 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"
            style={{
              left: `${minimap.x}%`,
              top: `${minimap.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Other users dots */}
          {otherUsers.map((u) => (
            <div
              key={u.socketId}
              className="absolute w-1.5 h-1.5 rounded-full opacity-70"
              style={{
                backgroundColor: u.avatarColor,
                left: `${(u.x / WORLD_WIDTH) * 100}%`,
                top: `${(u.y / WORLD_HEIGHT) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 text-center text-[8px] text-cosmos-muted/60 py-0.5 font-mono">
          MAP
        </div>
      </div>

      {/* Movement hint (fades out) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-cosmos-muted/40 text-xs font-mono animate-pulse">
        WASD or Arrow Keys to move
      </div>
    </div>
  );
}
