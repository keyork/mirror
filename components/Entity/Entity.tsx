'use client';

import { Canvas } from '@react-three/fiber';
import { OrganicBlob } from './OrganicBlob';
import { Particles } from './Particles';

export function Entity() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.8], fov: 42 }}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      dpr={1}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
    >
      <fog attach="fog" args={['#04050b', 4.6, 10]} />
      <OrganicBlob />
      <Particles />
    </Canvas>
  );
}
