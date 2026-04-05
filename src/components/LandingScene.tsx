'use client';

import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const KANJI = ['技', '道', '創', '学', '知', '力', '心', '夢', '光', '風', '魂', '志', '理', '形', '意'];
const PARTICLE_COUNT = 60;
const COLOR_ACCENT = new THREE.Color('#B83232');
const COLOR_WARM = new THREE.Color('#C8C0B5');
const COLOR_FAINT = new THREE.Color('#DDD7CE');

// Floating particles — warm-toned dots drifting in 3D
function Particles() {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors, sizes, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 14;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 8 - 2;

      velocities[i3] = (Math.random() - 0.5) * 0.003;
      velocities[i3 + 1] = Math.random() * 0.004 + 0.001;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.002;

      // Most particles warm/faint, ~15% accent red
      const color = Math.random() < 0.15 ? COLOR_ACCENT : Math.random() < 0.5 ? COLOR_WARM : COLOR_FAINT;
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 1;
    }
    return { positions, colors, sizes, velocities };
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] += velocities[i3];
      pos[i3 + 1] += velocities[i3 + 1];
      pos[i3 + 2] += velocities[i3 + 2];

      // Wrap around
      if (pos[i3 + 1] > 6) { pos[i3 + 1] = -6; pos[i3] = (Math.random() - 0.5) * 14; }
      if (pos[i3] > 8) pos[i3] = -8;
      if (pos[i3] < -8) pos[i3] = 8;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  );
}

// Floating kanji text sprites
function KanjiSprite({ char, position, speed, rotSpeed, opacity }: {
  char: string;
  position: [number, number, number];
  speed: number;
  rotSpeed: number;
  opacity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 128, 128);
    ctx.font = '80px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#B83232';
    ctx.globalAlpha = 1;
    ctx.fillText(char, 64, 68);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [char]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.position.y += speed * delta;
    meshRef.current.rotation.z += rotSpeed * delta;
    // Wrap
    if (meshRef.current.position.y > 6) {
      meshRef.current.position.y = -6;
      meshRef.current.position.x = (Math.random() - 0.5) * 12;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[1.2, 1.2]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function KanjiField() {
  const kanjis = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      char: KANJI[i % KANJI.length],
      position: [
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 4 - 3,
      ] as [number, number, number],
      speed: Math.random() * 0.15 + 0.05,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      opacity: Math.random() * 0.12 + 0.06,
    }));
  }, []);

  return (
    <>
      {kanjis.map((k, i) => (
        <KanjiSprite key={i} {...k} />
      ))}
    </>
  );
}

// Thin horizontal lines drifting — like ink rules on paper
function InkLines() {
  const ref = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      y: (Math.random() - 0.5) * 10,
      x: (Math.random() - 0.5) * 6,
      z: -2 - Math.random() * 3,
      width: Math.random() * 3 + 1.5,
      speed: Math.random() * 0.08 + 0.02,
      opacity: Math.random() * 0.08 + 0.03,
      isAccent: i < 2,
    }));
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      child.position.y += lines[i].speed * delta;
      if (child.position.y > 6) {
        child.position.y = -6;
        child.position.x = (Math.random() - 0.5) * 6;
      }
    });
  });

  return (
    <group ref={ref}>
      {lines.map((line, i) => (
        <mesh key={i} position={[line.x, line.y, line.z]}>
          <planeGeometry args={[line.width, 0.008]} />
          <meshBasicMaterial
            color={line.isAccent ? '#B83232' : '#C8C0B5'}
            transparent
            opacity={line.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// Gentle mouse-follow camera offset
function CameraRig() {
  const mouse = useRef({ x: 0, y: 0 });

  const handlePointerMove = useCallback((e: { clientX: number; clientY: number }) => {
    mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  // Attach listener once
  useMemo(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', handlePointerMove);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointermove', handlePointerMove);
      }
    };
  }, [handlePointerMove]);

  useFrame(({ camera }) => {
    camera.position.x += (mouse.current.x * 0.3 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.current.y * 0.2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function LandingScene() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'auto',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <CameraRig />
        <Particles />
        <KanjiField />
        <InkLines />
      </Canvas>
    </div>
  );
}
