import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Available character models - each has unique outfit/hairstyle
export const CHARACTER_MODELS = [
  { id: 'male-a', name: 'Casual', file: '/models/character-male-a.glb', gender: 'male' },
  { id: 'male-b', name: 'Athlete', file: '/models/character-male-b.glb', gender: 'male' },
  { id: 'male-c', name: 'Police', file: '/models/character-male-c.glb', gender: 'male' },
  { id: 'male-d', name: 'Gamer', file: '/models/character-male-d.glb', gender: 'male' },
  { id: 'male-e', name: 'Punk', file: '/models/character-male-e.glb', gender: 'male' },
  { id: 'male-f', name: 'Adventurer', file: '/models/character-male-f.glb', gender: 'male' },
  { id: 'female-a', name: 'Sporty', file: '/models/character-female-a.glb', gender: 'female' },
  { id: 'female-b', name: 'Trendy', file: '/models/character-female-b.glb', gender: 'female' },
  { id: 'female-c', name: 'Office', file: '/models/character-female-c.glb', gender: 'female' },
  { id: 'female-d', name: 'Pigtails', file: '/models/character-female-d.glb', gender: 'female' },
  { id: 'female-e', name: 'Curly', file: '/models/character-female-e.glb', gender: 'female' },
  { id: 'female-f', name: 'Bun', file: '/models/character-female-f.glb', gender: 'female' },
];

// Preload all models
CHARACTER_MODELS.forEach(char => {
  useGLTF.preload(char.file);
});

// Direction to rotation mapping
const DIRECTION_ROTATIONS = {
  up: Math.PI,
  down: 0,
  left: Math.PI / 2,
  right: -Math.PI / 2,
};

// Single character model with smooth rotation
function CharacterModel({ modelFile, scale = 1, targetRotation = 0, bobbing = false }) {
  const { scene } = useGLTF(modelFile);
  const groupRef = useRef();
  const currentRotation = useRef(0);
  
  // Clone the scene - preserve original materials and colors
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        // Clone material to avoid shared state
        child.material = child.material.clone();
        // Ensure proper rendering
        child.material.needsUpdate = true;
      }
    });
    
    return clone;
  }, [scene]);
  
  // Smooth rotation and bobbing animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth rotation interpolation
      const rotationDiff = targetRotation - currentRotation.current;
      // Handle wrap-around for smooth rotation
      let shortestDiff = rotationDiff;
      if (Math.abs(rotationDiff) > Math.PI) {
        shortestDiff = rotationDiff > 0 ? rotationDiff - Math.PI * 2 : rotationDiff + Math.PI * 2;
      }
      currentRotation.current += shortestDiff * 0.1;
      groupRef.current.rotation.y = currentRotation.current;
      
      // Bobbing animation
      if (bobbing) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2.5) * 0.03;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} scale={scale} />
    </group>
  );
}

// Loading fallback
function LoadingFallback({ color = '#6366f1' }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.4, 0.6, 0.4]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Main Avatar3D component for use in canvas
export function Avatar3DModel({ 
  characterId = 'male-a', 
  color = '#6366f1',
  scale = 1,
  direction = 'down',
  bobbing = true,
  isCurrentUser = false
}) {
  const character = CHARACTER_MODELS.find(c => c.id === characterId) || CHARACTER_MODELS[0];
  const targetRotation = DIRECTION_ROTATIONS[direction] || 0;
  
  return (
    <Suspense fallback={<LoadingFallback color={color} />}>
      <group>
        <CharacterModel 
          modelFile={character.file}
          scale={scale}
          targetRotation={targetRotation}
          bobbing={bobbing}
        />
        
        {/* Glow ring for current user */}
        {isCurrentUser && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5 * scale, 0.65 * scale, 32]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </Suspense>
  );
}

// Standalone preview component for lobby/selection - BIGGER SIZE
export function AvatarPreview3D({ 
  characterId = 'male-a', 
  color = '#6366f1',
  size = 200,
  autoRotate = true,
  className = ''
}) {
  return (
    <div className={`${className}`} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 1, 2.2], fov: 40 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        {/* Stronger lighting for proper color visibility */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <directionalLight position={[-3, 3, -3]} intensity={1} />
        <hemisphereLight intensity={0.8} groundColor="#1a1a2e" />
        
        {/* Accent colored light */}
        <pointLight position={[0, 2, 2]} intensity={0.5} color={color} />
        
        <Suspense fallback={<LoadingFallback color={color} />}>
          <Avatar3DModel 
            characterId={characterId}
            color={color}
            scale={1.1}
            direction="down"
            bobbing={false}
          />
        </Suspense>
        
        {autoRotate && (
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={3}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2.2}
          />
        )}
      </Canvas>
    </div>
  );
}

// Inline avatar for game canvas - BIGGER SIZE with smooth rotation
export function InlineAvatar3D({ 
  characterId = 'male-a', 
  color = '#6366f1',
  size = 80,
  isCurrentUser = false,
  direction = 'down',
  className = ''
}) {
  return (
    <div className={`${className}`} style={{ width: size, height: size * 1.3 }}>
      <Canvas
        camera={{ position: [0, 1.3, 2.8], fov: 32 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Strong lighting */}
        <ambientLight intensity={1.8} />
        <directionalLight position={[4, 5, 4]} intensity={2.2} />
        <directionalLight position={[-3, 3, -2]} intensity={0.8} />
        <hemisphereLight intensity={0.7} groundColor="#1a1a2e" />
        
        {/* Color accent light */}
        <pointLight position={[0, 1.5, 1.5]} intensity={0.4} color={color} />
        
        <Avatar3DModel 
          characterId={characterId}
          color={color}
          scale={1.15}
          direction={direction}
          bobbing={true}
          isCurrentUser={isCurrentUser}
        />
      </Canvas>
    </div>
  );
}

// Character selector grid - BIGGER thumbnails
export function CharacterSelector({ 
  selectedId, 
  onSelect, 
  color = '#6366f1',
  className = '' 
}) {
  return (
    <div className={`grid grid-cols-4 gap-4 ${className}`}>
      {CHARACTER_MODELS.map((char) => (
        <button
          key={char.id}
          onClick={() => onSelect(char.id)}
          className={`
            relative p-2 rounded-xl transition-all duration-300
            ${selectedId === char.id 
              ? 'bg-gradient-to-br from-violet-600/40 to-purple-600/40 ring-2 ring-violet-400 scale-105' 
              : 'bg-cosmos-surface/50 hover:bg-cosmos-surface hover:scale-102'
            }
          `}
        >
          <AvatarPreview3D 
            characterId={char.id}
            color={color}
            size={90}
            autoRotate={selectedId === char.id}
          />
          <span className={`
            block text-xs mt-1 text-center font-medium
            ${selectedId === char.id ? 'text-violet-300' : 'text-gray-400'}
          `}>
            {char.name}
          </span>
          
          {/* Selection indicator */}
          {selectedId === char.id && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export default Avatar3DModel;
