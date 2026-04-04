import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useCosmosStore } from '../store';

const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1200;
const MOVE_SPEED = 4;
const PROXIMITY_RADIUS = 150;

// Furniture configurations
const FURNITURE_CONFIG = {
  chair: { width: 40, height: 50, canSit: true, seatOffset: { x: 0, y: -10 } },
  sofa: { width: 100, height: 50, canSit: true, seats: 3, seatOffset: { x: 0, y: -5 } },
  stool: { width: 30, height: 35, canSit: true, seatOffset: { x: 0, y: -8 } },
  table: { width: 80, height: 60, canSit: false },
  desk: { width: 120, height: 60, canSit: false },
  cafe_table: { width: 50, height: 50, canSit: false },
  plant: { width: 30, height: 50, canSit: false },
  lamp: { width: 25, height: 60, canSit: false },
  whiteboard: { width: 100, height: 70, canSit: false },
  counter: { width: 150, height: 40, canSit: false },
};

// Room background colors
const ROOM_COLORS = {
  cozy: { floor: 0x2d1b4e, wall: 0x3d2b5e, accent: 0x8b5cf6 },
  professional: { floor: 0x1e3a5f, wall: 0x2e4a6f, accent: 0x3b82f6 },
  warm: { floor: 0x4a2c2a, wall: 0x5a3c3a, accent: 0xf97316 },
  cosmic: { floor: 0x1a0a2e, wall: 0x2a1a3e, accent: 0xa855f7 },
  nature: { floor: 0x1a3a2d, wall: 0x2a4a3d, accent: 0x22c55e },
  minimal: { floor: 0x2a2a2a, wall: 0x3a3a3a, accent: 0x94a3b8 },
  retro: { floor: 0x4a3a2a, wall: 0x5a4a3a, accent: 0xeab308 },
  neon: { floor: 0x0a1a2e, wall: 0x1a2a3e, accent: 0xec4899 },
};

const CosmosCanvas = ({ emit, socket }) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const playerRef = useRef(null);
  const otherPlayersRef = useRef({});
  const keysRef = useRef({});
  const frameCountRef = useRef(0);
  const furnitureRef = useRef([]);
  
  const { user, users, rooms, sittingOn, setSittingOn } = useCosmosStore();
  const [nearbyFurniture, setNearbyFurniture] = useState(null);

  // Create avatar sprite
  const createAvatar = useCallback((userData, isPlayer = false) => {
    const container = new PIXI.Container();
    const { color, style } = userData.avatar || { color: '#6366f1', style: 'round' };
    const colorNum = parseInt(color.replace('#', ''), 16);

    // Shadow
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.3);
    shadow.drawEllipse(0, 40, 20, 8);
    shadow.endFill();
    container.addChild(shadow);

    // Body
    const body = new PIXI.Graphics();
    body.beginFill(colorNum);
    body.drawEllipse(0, 30, 18, 12);
    body.endFill();
    container.addChild(body);

    // Head container for direction
    const headContainer = new PIXI.Container();
    headContainer.name = 'headContainer';

    const drawHead = (direction = 'down') => {
      headContainer.removeChildren();
      const head = new PIXI.Graphics();

      switch (style) {
        case 'cat':
          // Cat ears
          head.beginFill(colorNum);
          head.moveTo(-15, 0);
          head.lineTo(-8, -20);
          head.lineTo(0, 0);
          head.endFill();
          head.moveTo(15, 0);
          head.lineTo(8, -20);
          head.lineTo(0, 0);
          head.endFill();
          // Inner ears
          head.beginFill(0xfecaca);
          head.moveTo(-12, -2);
          head.lineTo(-8, -15);
          head.lineTo(-4, -2);
          head.endFill();
          head.moveTo(12, -2);
          head.lineTo(8, -15);
          head.lineTo(4, -2);
          head.endFill();
          // Face
          head.beginFill(colorNum);
          head.drawEllipse(0, 8, 18, 16);
          head.endFill();
          // Eyes based on direction
          head.beginFill(0xffffff);
          if (direction === 'left') {
            head.drawEllipse(-8, 5, 5, 6);
            head.drawEllipse(3, 5, 5, 6);
          } else if (direction === 'right') {
            head.drawEllipse(-3, 5, 5, 6);
            head.drawEllipse(8, 5, 5, 6);
          } else {
            head.drawEllipse(-6, 5, 5, 6);
            head.drawEllipse(6, 5, 5, 6);
          }
          head.endFill();
          head.beginFill(0x1e293b);
          if (direction === 'left') {
            head.drawCircle(-10, 6, 3);
            head.drawCircle(1, 6, 3);
          } else if (direction === 'right') {
            head.drawCircle(-1, 6, 3);
            head.drawCircle(10, 6, 3);
          } else if (direction === 'up') {
            // Eyes looking up
            head.drawCircle(-6, 3, 3);
            head.drawCircle(6, 3, 3);
          } else {
            head.drawCircle(-6, 7, 3);
            head.drawCircle(6, 7, 3);
          }
          head.endFill();
          // Nose
          head.beginFill(0xfecaca);
          head.drawEllipse(0, 12, 3, 2);
          head.endFill();
          break;

        case 'robot':
          // Antenna
          head.lineStyle(2, 0x94a3b8);
          head.moveTo(0, -20);
          head.lineTo(0, -10);
          head.beginFill(0xef4444);
          head.drawCircle(0, -22, 4);
          head.endFill();
          // Head
          head.lineStyle(0);
          head.beginFill(colorNum);
          head.drawRoundedRect(-18, -8, 36, 30, 5);
          head.endFill();
          // Eyes
          head.beginFill(0x0ea5e9);
          if (direction === 'left') {
            head.drawRoundedRect(-16, 0, 10, 8, 2);
            head.drawRoundedRect(-2, 0, 10, 8, 2);
          } else if (direction === 'right') {
            head.drawRoundedRect(-8, 0, 10, 8, 2);
            head.drawRoundedRect(6, 0, 10, 8, 2);
          } else {
            head.drawRoundedRect(-14, 0, 10, 8, 2);
            head.drawRoundedRect(4, 0, 10, 8, 2);
          }
          head.endFill();
          // Mouth
          head.beginFill(0x1e293b);
          head.drawRoundedRect(-8, 14, 16, 4, 2);
          head.endFill();
          break;

        case 'alien':
          // Head
          head.beginFill(colorNum);
          head.drawEllipse(0, 5, 20, 22);
          head.endFill();
          // Big eyes
          head.beginFill(0x1e293b);
          const eyeOffsetX = direction === 'left' ? -5 : direction === 'right' ? 5 : 0;
          head.drawEllipse(-8 + eyeOffsetX, 0, 8, 10);
          head.drawEllipse(8 + eyeOffsetX, 0, 8, 10);
          head.endFill();
          head.beginFill(0x22c55e);
          head.drawEllipse(-6 + eyeOffsetX, -2, 4, 5);
          head.drawEllipse(10 + eyeOffsetX, -2, 4, 5);
          head.endFill();
          head.beginFill(0xffffff);
          head.drawCircle(-8 + eyeOffsetX, -4, 2);
          head.drawCircle(8 + eyeOffsetX, -4, 2);
          head.endFill();
          break;

        case 'rounded-square':
          head.beginFill(colorNum);
          head.drawRoundedRect(-18, -5, 36, 35, 10);
          head.endFill();
          head.beginFill(0xffffff);
          const sqEyeOff = direction === 'left' ? -4 : direction === 'right' ? 4 : 0;
          head.drawEllipse(-7 + sqEyeOff, 8, 5, 6);
          head.drawEllipse(7 + sqEyeOff, 8, 5, 6);
          head.endFill();
          head.beginFill(0x1e293b);
          head.drawCircle(-7 + sqEyeOff, 10, 3);
          head.drawCircle(7 + sqEyeOff, 10, 3);
          head.endFill();
          // Blush
          head.beginFill(0xfecaca, 0.5);
          head.drawEllipse(-14, 14, 4, 3);
          head.drawEllipse(14, 14, 4, 3);
          head.endFill();
          break;

        default: // round
          head.beginFill(colorNum);
          head.drawCircle(0, 5, 20);
          head.endFill();
          head.beginFill(0xffffff);
          const eyeOff = direction === 'left' ? -4 : direction === 'right' ? 4 : 0;
          head.drawEllipse(-7 + eyeOff, 2, 5, 6);
          head.drawEllipse(7 + eyeOff, 2, 5, 6);
          head.endFill();
          head.beginFill(0x1e293b);
          const pupilOff = direction === 'up' ? -2 : direction === 'down' ? 2 : 0;
          head.drawCircle(-7 + eyeOff, 4 + pupilOff, 3);
          head.drawCircle(7 + eyeOff, 4 + pupilOff, 3);
          head.endFill();
          // Highlight
          head.beginFill(0xffffff);
          head.drawCircle(-9 + eyeOff, 1 + pupilOff, 1.5);
          head.drawCircle(5 + eyeOff, 1 + pupilOff, 1.5);
          head.endFill();
          // Blush
          head.beginFill(0xfecaca, 0.4);
          head.drawEllipse(-14, 8, 4, 3);
          head.drawEllipse(14, 8, 4, 3);
          head.endFill();
          break;
      }

      headContainer.addChild(head);
    };

    drawHead('down');
    container.addChild(headContainer);

    // Name tag
    const nameText = new PIXI.Text(userData.name, {
      fontFamily: 'Outfit',
      fontSize: 12,
      fill: 0xffffff,
      align: 'center',
      dropShadow: true,
      dropShadowAlpha: 0.5,
      dropShadowBlur: 2,
      dropShadowDistance: 1,
    });
    nameText.anchor.set(0.5, 0);
    nameText.y = 48;
    container.addChild(nameText);

    // Proximity ring for player
    if (isPlayer) {
      const ring = new PIXI.Graphics();
      ring.lineStyle(2, 0x8b5cf6, 0.3);
      ring.drawCircle(0, 20, PROXIMITY_RADIUS);
      ring.name = 'proximityRing';
      container.addChild(ring);
    }

    container.drawHead = drawHead;
    container.position.set(userData.position?.x || 400, userData.position?.y || 300);

    return container;
  }, []);

  // Draw furniture
  const drawFurniture = useCallback((graphics, type, x, y, rotation = 0) => {
    const config = FURNITURE_CONFIG[type];
    if (!config) return;

    graphics.rotation = (rotation * Math.PI) / 180;

    switch (type) {
      case 'chair':
        // Seat
        graphics.beginFill(0x8b4513);
        graphics.drawRoundedRect(-20, -15, 40, 30, 5);
        graphics.endFill();
        // Back
        graphics.beginFill(0xa0522d);
        graphics.drawRoundedRect(-20, -35, 40, 25, 5);
        graphics.endFill();
        // Legs
        graphics.beginFill(0x654321);
        graphics.drawRect(-18, 15, 6, 10);
        graphics.drawRect(12, 15, 6, 10);
        graphics.endFill();
        break;

      case 'sofa':
        // Base
        graphics.beginFill(0x6b21a8);
        graphics.drawRoundedRect(-50, -10, 100, 35, 8);
        graphics.endFill();
        // Back
        graphics.beginFill(0x7c3aed);
        graphics.drawRoundedRect(-50, -30, 100, 25, 8);
        graphics.endFill();
        // Arms
        graphics.beginFill(0x7c3aed);
        graphics.drawRoundedRect(-55, -25, 12, 35, 5);
        graphics.drawRoundedRect(43, -25, 12, 35, 5);
        graphics.endFill();
        // Cushions
        graphics.beginFill(0x8b5cf6, 0.5);
        graphics.drawEllipse(-25, 0, 20, 12);
        graphics.drawEllipse(0, 0, 20, 12);
        graphics.drawEllipse(25, 0, 20, 12);
        graphics.endFill();
        break;

      case 'stool':
        // Seat
        graphics.beginFill(0xd97706);
        graphics.drawCircle(0, 0, 15);
        graphics.endFill();
        // Legs
        graphics.beginFill(0x78350f);
        graphics.drawRect(-3, 15, 6, 15);
        graphics.endFill();
        break;

      case 'table':
        // Top
        graphics.beginFill(0x78350f);
        graphics.drawRoundedRect(-40, -20, 80, 40, 5);
        graphics.endFill();
        // Legs
        graphics.beginFill(0x451a03);
        graphics.drawRect(-35, 20, 8, 20);
        graphics.drawRect(27, 20, 8, 20);
        graphics.endFill();
        break;

      case 'desk':
        // Top
        graphics.beginFill(0x44403c);
        graphics.drawRoundedRect(-60, -20, 120, 35, 3);
        graphics.endFill();
        // Legs
        graphics.beginFill(0x292524);
        graphics.drawRect(-55, 15, 8, 25);
        graphics.drawRect(47, 15, 8, 25);
        graphics.endFill();
        // Drawer
        graphics.beginFill(0x57534e);
        graphics.drawRoundedRect(-30, -15, 60, 20, 2);
        graphics.endFill();
        graphics.beginFill(0x78716c);
        graphics.drawCircle(0, -5, 3);
        graphics.endFill();
        break;

      case 'cafe_table':
        // Top
        graphics.beginFill(0xfbbf24);
        graphics.drawCircle(0, 0, 25);
        graphics.endFill();
        // Pole
        graphics.beginFill(0x78350f);
        graphics.drawRect(-4, 25, 8, 20);
        graphics.endFill();
        // Base
        graphics.beginFill(0x78350f);
        graphics.drawEllipse(0, 45, 15, 5);
        graphics.endFill();
        break;

      case 'plant':
        // Pot
        graphics.beginFill(0xb45309);
        graphics.drawRect(-12, 10, 24, 25);
        graphics.moveTo(-15, 10);
        graphics.lineTo(15, 10);
        graphics.lineTo(12, 35);
        graphics.lineTo(-12, 35);
        graphics.closePath();
        graphics.endFill();
        // Leaves
        graphics.beginFill(0x22c55e);
        graphics.drawEllipse(-10, -5, 12, 20);
        graphics.drawEllipse(10, -8, 12, 18);
        graphics.drawEllipse(0, -15, 10, 22);
        graphics.endFill();
        graphics.beginFill(0x16a34a);
        graphics.drawEllipse(-5, -10, 8, 15);
        graphics.drawEllipse(8, -5, 8, 15);
        graphics.endFill();
        break;

      case 'lamp':
        // Base
        graphics.beginFill(0x78716c);
        graphics.drawEllipse(0, 30, 12, 5);
        graphics.endFill();
        // Pole
        graphics.beginFill(0xa8a29e);
        graphics.drawRect(-3, -20, 6, 50);
        graphics.endFill();
        // Shade
        graphics.beginFill(0xfef3c7);
        graphics.moveTo(-15, -25);
        graphics.lineTo(15, -25);
        graphics.lineTo(10, -45);
        graphics.lineTo(-10, -45);
        graphics.closePath();
        graphics.endFill();
        // Glow
        graphics.beginFill(0xfef9c3, 0.3);
        graphics.drawCircle(0, -15, 25);
        graphics.endFill();
        break;

      case 'whiteboard':
        // Frame
        graphics.beginFill(0x78716c);
        graphics.drawRoundedRect(-52, -40, 104, 80, 3);
        graphics.endFill();
        // Board
        graphics.beginFill(0xffffff);
        graphics.drawRect(-48, -36, 96, 72);
        graphics.endFill();
        // Marker tray
        graphics.beginFill(0x525252);
        graphics.drawRect(-40, 38, 80, 8);
        graphics.endFill();
        // Some writing
        graphics.lineStyle(2, 0x3b82f6);
        graphics.moveTo(-30, -20);
        graphics.lineTo(30, -20);
        graphics.moveTo(-30, -5);
        graphics.lineTo(20, -5);
        graphics.moveTo(-30, 10);
        graphics.lineTo(10, 10);
        graphics.endFill();
        break;

      case 'counter':
        // Counter top
        graphics.beginFill(0x451a03);
        graphics.drawRoundedRect(-75, -15, 150, 30, 5);
        graphics.endFill();
        // Front
        graphics.beginFill(0x78350f);
        graphics.drawRoundedRect(-75, 15, 150, 20, 3);
        graphics.endFill();
        // Coffee machine
        graphics.beginFill(0x1f2937);
        graphics.drawRoundedRect(40, -35, 25, 25, 3);
        graphics.endFill();
        graphics.beginFill(0x374151);
        graphics.drawRect(45, -30, 15, 10);
        graphics.endFill();
        break;
    }
  }, []);

  // Initialize PIXI app
  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x0a0a1a,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    canvasRef.current.appendChild(app.view);
    appRef.current = app;

    // World container
    const world = new PIXI.Container();
    world.name = 'world';
    app.stage.addChild(world);

    // Draw grid floor
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0x1e1e3a, 0.5);
    for (let x = 0; x <= WORLD_WIDTH; x += 50) {
      grid.moveTo(x, 0);
      grid.lineTo(x, WORLD_HEIGHT);
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += 50) {
      grid.moveTo(0, y);
      grid.lineTo(WORLD_WIDTH, y);
    }
    world.addChild(grid);

    // Draw rooms
    rooms.forEach((room) => {
      const roomContainer = new PIXI.Container();
      roomContainer.name = `room-${room.id}`;
      roomContainer.x = room.x;
      roomContainer.y = room.y;

      const colors = ROOM_COLORS[room.backgroundType] || ROOM_COLORS.cosmic;

      // Room floor
      const floor = new PIXI.Graphics();
      floor.beginFill(colors.floor);
      floor.drawRoundedRect(0, 0, room.width, room.height, 15);
      floor.endFill();
      roomContainer.addChild(floor);

      // Room border
      const border = new PIXI.Graphics();
      border.lineStyle(3, colors.accent, 0.6);
      border.drawRoundedRect(0, 0, room.width, room.height, 15);
      roomContainer.addChild(border);

      // Room name
      const nameText = new PIXI.Text(room.name, {
        fontFamily: 'Outfit',
        fontSize: 18,
        fill: colors.accent,
        fontWeight: 'bold',
      });
      nameText.x = 15;
      nameText.y = 10;
      roomContainer.addChild(nameText);

      // Draw furniture
      if (room.furniture) {
        room.furniture.forEach((furn, idx) => {
          const furnGraphics = new PIXI.Graphics();
          furnGraphics.x = furn.x;
          furnGraphics.y = furn.y;
          furnGraphics.name = `furniture-${room.id}-${idx}`;
          furnGraphics.interactive = true;
          furnGraphics.buttonMode = true;
          furnGraphics.furnitureData = { ...furn, roomId: room.id, index: idx };
          
          drawFurniture(furnGraphics, furn.type, furn.x, furn.y, furn.rotation);
          
          // Store reference
          furnitureRef.current.push({
            graphics: furnGraphics,
            data: { ...furn, roomId: room.id, index: idx },
            worldX: room.x + furn.x,
            worldY: room.y + furn.y,
          });

          roomContainer.addChild(furnGraphics);
        });
      }

      world.addChild(roomContainer);
    });

    // Cleanup
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        appRef.current = null;
      }
    };
  }, [rooms, drawFurniture]);

  // Create/update player sprite
  useEffect(() => {
    if (!appRef.current || !user) return;

    const world = appRef.current.stage.getChildByName('world');
    if (!world) return;

    if (!playerRef.current) {
      const playerSprite = createAvatar(user, true);
      playerSprite.name = 'player';
      world.addChild(playerSprite);
      playerRef.current = playerSprite;
    }
  }, [user, createAvatar]);

  // Update other players
  useEffect(() => {
    if (!appRef.current) return;

    const world = appRef.current.stage.getChildByName('world');
    if (!world) return;

    // Add new users
    users.forEach((userData) => {
      if (!otherPlayersRef.current[userData.odestined]) {
        const sprite = createAvatar(userData);
        sprite.name = `user-${userData.odestined}`;
        world.addChild(sprite);
        otherPlayersRef.current[userData.odestined] = sprite;
      }
    });

    // Remove disconnected users
    Object.keys(otherPlayersRef.current).forEach((odestined) => {
      if (!users.find((u) => u.odestined === odestined)) {
        const sprite = otherPlayersRef.current[odestined];
        world.removeChild(sprite);
        sprite.destroy();
        delete otherPlayersRef.current[odestined];
      }
    });

    // Update positions
    users.forEach((userData) => {
      const sprite = otherPlayersRef.current[userData.odestined];
      if (sprite && userData.position) {
        // Smooth interpolation
        sprite.x += (userData.position.x - sprite.x) * 0.2;
        sprite.y += (userData.position.y - sprite.y) * 0.2;

        // Update direction
        if (sprite.drawHead && userData.direction) {
          sprite.drawHead(userData.direction);
        }

        // Sitting animation
        if (userData.isSitting) {
          sprite.scale.y = 0.85;
        } else {
          sprite.scale.y = 1;
        }
      }
    });
  }, [users, createAvatar]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      
      // Sit/stand on E key
      if (e.key.toLowerCase() === 'e' && nearbyFurniture) {
        if (sittingOn) {
          emit('user:stand');
          setSittingOn(null);
        } else if (nearbyFurniture.data.canSit || FURNITURE_CONFIG[nearbyFurniture.data.type]?.canSit) {
          const config = FURNITURE_CONFIG[nearbyFurniture.data.type];
          const seatPos = {
            x: nearbyFurniture.worldX + (config?.seatOffset?.x || 0),
            y: nearbyFurniture.worldY + (config?.seatOffset?.y || 0),
          };
          emit('user:sit', {
            furnitureId: `${nearbyFurniture.data.roomId}-${nearbyFurniture.data.index}`,
            position: seatPos,
          });
          setSittingOn(nearbyFurniture.data);
          
          // Move player to seat
          if (playerRef.current) {
            playerRef.current.x = seatPos.x;
            playerRef.current.y = seatPos.y;
          }
        }
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [emit, nearbyFurniture, sittingOn, setSittingOn]);

  // Game loop
  useEffect(() => {
    if (!appRef.current) return;

    const gameLoop = () => {
      if (!playerRef.current || !user || sittingOn) return;

      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;
      let direction = null;

      if (keys['w'] || keys['arrowup']) {
        dy = -1;
        direction = 'up';
      }
      if (keys['s'] || keys['arrowdown']) {
        dy = 1;
        direction = 'down';
      }
      if (keys['a'] || keys['arrowleft']) {
        dx = -1;
        direction = 'left';
      }
      if (keys['d'] || keys['arrowright']) {
        dx = 1;
        direction = 'right';
      }

      // Diagonal normalization
      if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
      }

      if (dx !== 0 || dy !== 0) {
        const newX = Math.max(30, Math.min(WORLD_WIDTH - 30, playerRef.current.x + dx * MOVE_SPEED));
        const newY = Math.max(30, Math.min(WORLD_HEIGHT - 30, playerRef.current.y + dy * MOVE_SPEED));

        playerRef.current.x = newX;
        playerRef.current.y = newY;

        // Update direction
        if (playerRef.current.drawHead && direction) {
          playerRef.current.drawHead(direction);
        }

        // Emit position every 2 frames
        frameCountRef.current++;
        if (frameCountRef.current % 2 === 0) {
          emit('user:move', {
            position: { x: newX, y: newY },
            direction,
          });
        }
      }

      // Check for nearby furniture
      let closest = null;
      let closestDist = 60;

      furnitureRef.current.forEach((furn) => {
        const dist = Math.sqrt(
          Math.pow(playerRef.current.x - furn.worldX, 2) +
          Math.pow(playerRef.current.y - furn.worldY, 2)
        );
        if (dist < closestDist && (furn.data.canSit || FURNITURE_CONFIG[furn.data.type]?.canSit)) {
          closest = furn;
          closestDist = dist;
        }
      });

      setNearbyFurniture(closest);

      // Camera follow
      const world = appRef.current.stage.getChildByName('world');
      if (world) {
        const targetX = appRef.current.screen.width / 2 - playerRef.current.x;
        const targetY = appRef.current.screen.height / 2 - playerRef.current.y;
        world.x += (targetX - world.x) * 0.1;
        world.y += (targetY - world.y) * 0.1;
      }
    };

    appRef.current.ticker.add(gameLoop);

    return () => {
      if (appRef.current) {
        appRef.current.ticker.remove(gameLoop);
      }
    };
  }, [emit, user, sittingOn]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (appRef.current) {
        appRef.current.renderer.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={canvasRef} className="absolute inset-0">
      {/* Sit prompt */}
      {nearbyFurniture && !sittingOn && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 glass px-4 py-2 rounded-lg text-sm">
          Press <span className="font-mono bg-purple-500/30 px-2 py-0.5 rounded mx-1">E</span> to sit
        </div>
      )}
      {sittingOn && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 glass px-4 py-2 rounded-lg text-sm">
          Press <span className="font-mono bg-purple-500/30 px-2 py-0.5 rounded mx-1">E</span> to stand
        </div>
      )}
    </div>
  );
};

export default CosmosCanvas;
