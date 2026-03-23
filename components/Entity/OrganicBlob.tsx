'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { AppMode, EntityState, useAppStore } from '@/stores/useAppStore';

type StateConfig = {
  blueColor: string;
  redColor: string;
  greenColor: string;
  violetColor: string;
  goldColor: string;
  coreColor: string;
  dustColor: string;
  scale: number;
  y: number;
  opacity: number;
  pulse: number;
  drift: number;
};

type LayerConfig = {
  texture: 'veil' | 'wisp' | 'core';
  colorKey: 'blueColor' | 'redColor' | 'greenColor' | 'violetColor' | 'goldColor' | 'coreColor' | 'dustColor';
  position: [number, number, number];
  scale: [number, number, number];
  rotation: number;
  speed: number;
  pulse: number;
  opacity: number;
};

const stateConfigs: Record<EntityState, StateConfig> = {
  idle: {
    blueColor: '#6f8fff',
    redColor: '#ff6a7c',
    greenColor: '#5fd7b1',
    violetColor: '#a47cff',
    goldColor: '#f0c45f',
    coreColor: '#fff2c8',
    dustColor: '#a4b1e5',
    scale: 1,
    y: 0.04,
    opacity: 1,
    pulse: 0.05,
    drift: 0.16,
  },
  listening: {
    blueColor: '#83a1ff',
    redColor: '#ff7a8e',
    greenColor: '#74e0be',
    violetColor: '#b08cff',
    goldColor: '#f6cf71',
    coreColor: '#fff6d6',
    dustColor: '#b5c0ec',
    scale: 0.96,
    y: -0.04,
    opacity: 1.12,
    pulse: 0.06,
    drift: 0.22,
  },
  responding: {
    blueColor: '#97b1ff',
    redColor: '#ff8a95',
    greenColor: '#7de7cc',
    violetColor: '#bc9aff',
    goldColor: '#ffd16e',
    coreColor: '#fff7de',
    dustColor: '#c0caf7',
    scale: 1.03,
    y: 0.08,
    opacity: 1.18,
    pulse: 0.07,
    drift: 0.2,
  },
  deep: {
    blueColor: '#6e7fd6',
    redColor: '#c66cc7',
    greenColor: '#4ebc9f',
    violetColor: '#b68cff',
    goldColor: '#b99fd9',
    coreColor: '#e8deff',
    dustColor: '#98a3d3',
    scale: 0.92,
    y: -0.06,
    opacity: 0.9,
    pulse: 0.04,
    drift: 0.12,
  },
  constellation: {
    blueColor: '#7da8ff',
    redColor: '#cf84ff',
    greenColor: '#69d8c5',
    violetColor: '#c1a2ff',
    goldColor: '#a9cbff',
    coreColor: '#e6f2ff',
    dustColor: '#9bb8e7',
    scale: 0.84,
    y: 0.24,
    opacity: 0.8,
    pulse: 0.035,
    drift: 0.1,
  },
  experiment: {
    blueColor: '#7e9bff',
    redColor: '#ff8376',
    greenColor: '#74d9af',
    violetColor: '#a782ff',
    goldColor: '#ffc861',
    coreColor: '#fff0c8',
    dustColor: '#acb6e1',
    scale: 0.98,
    y: 0.12,
    opacity: 1.06,
    pulse: 0.055,
    drift: 0.18,
  },
};

const nebulaLayers: LayerConfig[] = [
  {
    texture: 'veil',
    colorKey: 'blueColor',
    position: [-0.54, 0.18, -0.1],
    scale: [4.6, 2.45, 1],
    rotation: 0.22,
    speed: 0.11,
    pulse: 0.8,
    opacity: 0.23,
  },
  {
    texture: 'veil',
    colorKey: 'violetColor',
    position: [0.6, -0.02, -0.14],
    scale: [4.9, 2.7, 1],
    rotation: -0.3,
    speed: 0.09,
    pulse: 1.05,
    opacity: 0.21,
  },
  {
    texture: 'wisp',
    colorKey: 'redColor',
    position: [0.18, -0.2, 0.04],
    scale: [3.5, 1.95, 1],
    rotation: -0.08,
    speed: 0.16,
    pulse: 1.1,
    opacity: 0.24,
  },
  {
    texture: 'wisp',
    colorKey: 'goldColor',
    position: [-0.16, 0.34, 0.06],
    scale: [3.1, 1.72, 1],
    rotation: -0.48,
    speed: 0.13,
    pulse: 0.9,
    opacity: 0.2,
  },
  {
    texture: 'veil',
    colorKey: 'greenColor',
    position: [0.44, 0.34, -0.12],
    scale: [3.2, 1.75, 1],
    rotation: 0.42,
    speed: 0.12,
    pulse: 0.9,
    opacity: 0.14,
  },
  {
    texture: 'veil',
    colorKey: 'dustColor',
    position: [0.05, 0.04, -0.18],
    scale: [5.3, 3, 1],
    rotation: 0.04,
    speed: 0.07,
    pulse: 1.2,
    opacity: 0.16,
  },
  {
    texture: 'core',
    colorKey: 'coreColor',
    position: [0.22, -0.04, 0.1],
    scale: [2.55, 1.82, 1],
    rotation: -0.18,
    speed: 0.18,
    pulse: 1.2,
    opacity: 0.3,
  },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function createRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function getResponsiveLayout(mode: AppMode, width: number, height: number) {
  const aspect = width / Math.max(height, 1);
  const wideBias = Math.max(0, Math.min((aspect - 1.45) / 0.7, 1));
  const shortBias = Math.max(0, Math.min((920 - height) / 240, 1));
  const pressure = Math.max(wideBias, shortBias);

  if (mode === 'chat') {
    return {
      yOffset: -0.18 - pressure * 0.55,
      scaleMultiplier: 1 - pressure * 0.2,
      opacityMultiplier: 1 - pressure * 0.12,
    };
  }

  if (mode === 'experiment') {
    return {
      yOffset: -0.08 - pressure * 0.24,
      scaleMultiplier: 1 - pressure * 0.1,
      opacityMultiplier: 1 - pressure * 0.08,
    };
  }

  return {
    yOffset: 0,
    scaleMultiplier: 1 - pressure * 0.05,
    opacityMultiplier: 1,
  };
}

function createNebulaTexture(seed: number, variant: 'veil' | 'wisp' | 'core') {
  const random = createRandom(seed);
  const size = 320;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.Texture();
  }

  ctx.clearRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'screen';

  const strokeCount = variant === 'veil' ? 11 : variant === 'wisp' ? 8 : 6;
  const spreadX = variant === 'core' ? 0.22 : variant === 'wisp' ? 0.42 : 0.56;
  const spreadY = variant === 'core' ? 0.14 : variant === 'wisp' ? 0.2 : 0.3;
  const radiusBase = variant === 'core' ? 44 : variant === 'wisp' ? 62 : 84;

  for (let i = 0; i < strokeCount; i += 1) {
    const t = i / (strokeCount - 1);
    const x = size * (0.5 - spreadX + t * spreadX * 2 + (random() - 0.5) * 0.07);
    const yWave = Math.sin(t * Math.PI * (variant === 'veil' ? 1.4 : 1.9) + seed * 0.17);
    const y = size * (0.5 + yWave * spreadY + (random() - 0.5) * 0.09);
    const radius = radiusBase * (0.8 + random() * 0.65);
    const squish = 0.48 + random() * 0.46;
    const rotation = (random() - 0.5) * (variant === 'veil' ? 0.9 : 0.6);
    const alpha = variant === 'core' ? 0.19 + random() * 0.12 : 0.08 + random() * 0.08;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(1, squish);

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
    gradient.addColorStop(0.32, `rgba(255,255,255,${alpha * 0.7})`);
    gradient.addColorStop(0.74, `rgba(255,255,255,${alpha * 0.18})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (variant !== 'core') {
    const haze = ctx.createRadialGradient(size / 2, size / 2, size * 0.06, size / 2, size / 2, size * 0.46);
    haze.addColorStop(0, 'rgba(255,255,255,0.11)');
    haze.addColorStop(0.38, 'rgba(255,255,255,0.05)');
    haze.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function OrganicBlob() {
  const { size } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const spriteRefs = useRef<Array<THREE.Sprite | null>>([]);
  const entityState = useAppStore((state) => state.entityState);
  const mode = useAppStore((state) => state.mode);
  const timeRef = useRef(0);
  const currentConfig = useRef(stateConfigs.idle);

  const textures = useMemo(
    () => ({
      veil: createNebulaTexture(11, 'veil'),
      wisp: createNebulaTexture(29, 'wisp'),
      core: createNebulaTexture(47, 'core'),
    }),
    []
  );

  useFrame((_, delta) => {
    const target = stateConfigs[entityState];
    const responsiveLayout = getResponsiveLayout(mode, size.width, size.height);
    const lerpFactor = Math.min(delta * 1.2, 1);

    currentConfig.current = {
      blueColor: target.blueColor,
      redColor: target.redColor,
      greenColor: target.greenColor,
      violetColor: target.violetColor,
      goldColor: target.goldColor,
      coreColor: target.coreColor,
      dustColor: target.dustColor,
      scale: lerp(currentConfig.current.scale, target.scale, lerpFactor),
      y: lerp(currentConfig.current.y, target.y, lerpFactor),
      opacity: lerp(currentConfig.current.opacity, target.opacity, lerpFactor),
      pulse: lerp(currentConfig.current.pulse, target.pulse, lerpFactor),
      drift: lerp(currentConfig.current.drift, target.drift, lerpFactor),
    };

    timeRef.current += delta * 0.34;
    const config = currentConfig.current;
    const t = timeRef.current;

    if (groupRef.current) {
      const baseScale = config.scale * responsiveLayout.scaleMultiplier;
      groupRef.current.position.y =
        config.y + responsiveLayout.yOffset + Math.sin(t * 0.65) * config.drift * 0.08;
      groupRef.current.position.x = Math.sin(t * 0.3) * config.drift * 0.14;
      groupRef.current.scale.setScalar(baseScale);
    }

    nebulaLayers.forEach((layer, index) => {
      const sprite = spriteRefs.current[index];
      if (!sprite) return;

      const pulse = 1 + Math.sin(t * layer.speed + index * 1.3) * config.pulse * 0.1 * layer.pulse;
      sprite.position.set(
        layer.position[0] + Math.sin(t * layer.speed * 0.7 + index) * 0.1,
        layer.position[1] + Math.cos(t * layer.speed * 0.8 + index * 0.6) * 0.08,
        layer.position[2]
      );
      sprite.scale.set(layer.scale[0] * pulse, layer.scale[1] * pulse, 1);

      const material = sprite.material as THREE.SpriteMaterial;
      material.rotation = layer.rotation + Math.sin(t * layer.speed * 0.5 + index * 0.4) * 0.12;
      material.color.set(config[layer.colorKey]);
      material.opacity = layer.opacity * config.opacity * responsiveLayout.opacityMultiplier;
    });
  });

  return (
    <group ref={groupRef}>
      {nebulaLayers.map((layer, index) => (
        <sprite
          key={`${layer.texture}-${index}`}
          ref={(node) => {
            spriteRefs.current[index] = node;
          }}
          position={[layer.position[0], layer.position[1], layer.position[2]]}
          scale={[layer.scale[0], layer.scale[1], layer.scale[2]]}
        >
          <spriteMaterial
            map={textures[layer.texture]}
            color={stateConfigs.idle[layer.colorKey]}
            transparent
            opacity={layer.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
}
