'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EntityState, useAppStore } from '@/stores/useAppStore';

type StateConfig = {
  coreColor: [number, number, number];
  glowColor: [number, number, number];
  haloColor: [number, number, number];
  breathAmp: number;
  noiseScale: number;
  deformStrength: number;
  timeSpeed: number;
  scale: number;
  y: number;
  opacity: number;
  ringOpacity: number;
};

const stateConfigs: Record<EntityState, StateConfig> = {
  idle: {
    coreColor: [0.78, 0.66, 0.54],
    glowColor: [0.95, 0.74, 0.42],
    haloColor: [0.58, 0.62, 1.0],
    breathAmp: 0.045,
    noiseScale: 1.5,
    deformStrength: 0.18,
    timeSpeed: 0.22,
    scale: 1,
    y: 0.04,
    opacity: 0.68,
    ringOpacity: 0.26,
  },
  listening: {
    coreColor: [0.88, 0.74, 0.58],
    glowColor: [1.0, 0.86, 0.54],
    haloColor: [0.72, 0.77, 1.0],
    breathAmp: 0.06,
    noiseScale: 1.8,
    deformStrength: 0.22,
    timeSpeed: 0.35,
    scale: 0.96,
    y: 0.03,
    opacity: 0.76,
    ringOpacity: 0.34,
  },
  responding: {
    coreColor: [0.93, 0.81, 0.63],
    glowColor: [1.0, 0.9, 0.68],
    haloColor: [0.82, 0.72, 1.0],
    breathAmp: 0.075,
    noiseScale: 1.5,
    deformStrength: 0.2,
    timeSpeed: 0.28,
    scale: 1.04,
    y: 0.08,
    opacity: 0.78,
    ringOpacity: 0.38,
  },
  deep: {
    coreColor: [0.56, 0.58, 0.76],
    glowColor: [0.7, 0.61, 0.92],
    haloColor: [0.42, 0.5, 1.0],
    breathAmp: 0.035,
    noiseScale: 1.2,
    deformStrength: 0.12,
    timeSpeed: 0.15,
    scale: 0.92,
    y: -0.02,
    opacity: 0.6,
    ringOpacity: 0.22,
  },
  constellation: {
    coreColor: [0.46, 0.62, 0.85],
    glowColor: [0.61, 0.81, 1.0],
    haloColor: [0.62, 0.76, 1.0],
    breathAmp: 0.03,
    noiseScale: 1,
    deformStrength: 0.1,
    timeSpeed: 0.18,
    scale: 0.82,
    y: 0.3,
    opacity: 0.54,
    ringOpacity: 0.2,
  },
  experiment: {
    coreColor: [0.91, 0.72, 0.52],
    glowColor: [1.0, 0.82, 0.54],
    haloColor: [0.54, 0.7, 1.0],
    breathAmp: 0.05,
    noiseScale: 1.4,
    deformStrength: 0.16,
    timeSpeed: 0.25,
    scale: 0.96,
    y: 0.12,
    opacity: 0.72,
    ringOpacity: 0.3,
  },
};

const vertexShader = `
uniform float uTime;
uniform float uBreathAmp;
uniform float uNoiseScale;
uniform float uDeformStrength;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  float noise = snoise(vec3(
    position.x * uNoiseScale + uTime * 0.2,
    position.y * uNoiseScale + uTime * 0.15,
    position.z * uNoiseScale + uTime * 0.1
  ));
  float breath = sin(uTime * 0.6) * uBreathAmp;
  float displacement = noise * uDeformStrength + breath;
  vec3 newPosition = position + normal * displacement;
  vNormal = normal;
  vPosition = newPosition;
  vDisplacement = displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader = `
uniform vec3 uCoreColor;
uniform vec3 uGlowColor;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = 1.0 - dot(viewDir, vNormal);
  fresnel = pow(fresnel, 2.3);
  float pulse = smoothstep(-0.18, 0.24, vDisplacement);
  vec3 color = mix(uCoreColor, uGlowColor, clamp(fresnel * 0.88 + pulse * 0.24, 0.0, 1.0));
  float glow = smoothstep(0.0, 0.6, fresnel) * 0.72;
  float alpha = (0.14 + glow + fresnel * 0.26 + pulse * 0.14) * uOpacity;
  gl_FragColor = vec4(color, alpha);
}
`;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export function OrganicBlob() {
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.MeshBasicMaterial>(null);
  const auraRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringARef = useRef<THREE.MeshBasicMaterial>(null);
  const ringBRef = useRef<THREE.MeshBasicMaterial>(null);
  const entityState = useAppStore((state) => state.entityState);
  const timeRef = useRef(0);
  const currentConfig = useRef(stateConfigs.idle);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBreathAmp: { value: stateConfigs.idle.breathAmp },
      uNoiseScale: { value: stateConfigs.idle.noiseScale },
      uDeformStrength: { value: stateConfigs.idle.deformStrength },
      uCoreColor: { value: new THREE.Color(...stateConfigs.idle.coreColor) },
      uGlowColor: { value: new THREE.Color(...stateConfigs.idle.glowColor) },
      uOpacity: { value: stateConfigs.idle.opacity },
    }),
    []
  );

  useFrame((_, delta) => {
    const target = stateConfigs[entityState];
    const lerpFactor = Math.min(delta * 1.2, 1);

    currentConfig.current = {
      coreColor: lerpColor(currentConfig.current.coreColor, target.coreColor, lerpFactor),
      glowColor: lerpColor(currentConfig.current.glowColor, target.glowColor, lerpFactor),
      haloColor: lerpColor(currentConfig.current.haloColor, target.haloColor, lerpFactor),
      breathAmp: lerp(currentConfig.current.breathAmp, target.breathAmp, lerpFactor),
      noiseScale: lerp(currentConfig.current.noiseScale, target.noiseScale, lerpFactor),
      deformStrength: lerp(currentConfig.current.deformStrength, target.deformStrength, lerpFactor),
      timeSpeed: lerp(currentConfig.current.timeSpeed, target.timeSpeed, lerpFactor),
      scale: lerp(currentConfig.current.scale, target.scale, lerpFactor),
      y: lerp(currentConfig.current.y, target.y, lerpFactor),
      opacity: lerp(currentConfig.current.opacity, target.opacity, lerpFactor),
      ringOpacity: lerp(currentConfig.current.ringOpacity, target.ringOpacity, lerpFactor),
    };

    timeRef.current += delta * currentConfig.current.timeSpeed;

    uniforms.uTime.value = timeRef.current;
    uniforms.uBreathAmp.value = currentConfig.current.breathAmp;
    uniforms.uNoiseScale.value = currentConfig.current.noiseScale;
    uniforms.uDeformStrength.value = currentConfig.current.deformStrength;
    uniforms.uCoreColor.value.setRGB(...currentConfig.current.coreColor);
    uniforms.uGlowColor.value.setRGB(...currentConfig.current.glowColor);
    uniforms.uOpacity.value = currentConfig.current.opacity;

    if (groupRef.current) {
      const bob = Math.sin(timeRef.current * 1.6) * 0.025;
      const scalePulse = 1 + Math.sin(timeRef.current * 1.2) * 0.012;
      groupRef.current.position.y = currentConfig.current.y + bob;
      groupRef.current.scale.setScalar(currentConfig.current.scale * scalePulse);
      groupRef.current.rotation.y += delta * 0.035;
      groupRef.current.rotation.z = Math.sin(timeRef.current * 0.45) * 0.025;
    }

    const haloColor = new THREE.Color().setRGB(...currentConfig.current.haloColor);
    const auraColor = new THREE.Color().setRGB(...currentConfig.current.glowColor);

    if (haloRef.current) {
      haloRef.current.color.copy(haloColor);
      haloRef.current.opacity = currentConfig.current.opacity * 0.18;
    }

    if (auraRef.current) {
      auraRef.current.color.copy(auraColor);
      auraRef.current.opacity = currentConfig.current.opacity * 0.1;
    }

    if (ringARef.current) {
      ringARef.current.color.copy(haloColor);
      ringARef.current.opacity = currentConfig.current.ringOpacity;
    }

    if (ringBRef.current) {
      ringBRef.current.color.copy(auraColor);
      ringBRef.current.opacity = currentConfig.current.ringOpacity * 0.7;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1.16, 72, 72]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>

      <mesh scale={1.34}>
        <sphereGeometry args={[1.24, 28, 28]} />
        <meshBasicMaterial
          ref={haloRef}
          color="#9ab5ff"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh scale={1.78}>
        <sphereGeometry args={[1.5, 20, 20]} />
        <meshBasicMaterial
          ref={auraRef}
          color="#f1c48e"
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh rotation={[Math.PI * 0.42, 0, 0]} scale={[1.45, 1.05, 1.45]}>
        <torusGeometry args={[1.56, 0.018, 12, 64]} />
        <meshBasicMaterial
          ref={ringARef}
          color="#99b6ff"
          transparent
          opacity={0.26}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh rotation={[-Math.PI * 0.2, 0, Math.PI * 0.12]} scale={[1.88, 1.1, 1.88]}>
        <torusGeometry args={[1.68, 0.01, 10, 52]} />
        <meshBasicMaterial
          ref={ringBRef}
          color="#f6d2a0"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
