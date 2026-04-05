'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const COLORS = ['#8B5CF6', '#10B981', '#F97316', '#3B82F6', '#EF4444', '#EC4899'];

function FloatingNode({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.5;
    meshRef.current.rotation.x = t * 0.3;
    meshRef.current.rotation.z = t * 0.2;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.3]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        toneMapped={false}
      />
    </mesh>
  );
}

function AutoRotateScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const nodes = COLORS.map((color, i) => {
    const angle = (i / COLORS.length) * Math.PI * 2;
    const r = 4 + Math.random() * 2;
    return {
      position: [
        Math.cos(angle) * r,
        (Math.random() - 0.5) * 3,
        Math.sin(angle) * r,
      ] as [number, number, number],
      color,
      speed: 0.5 + Math.random() * 0.5,
    };
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.4} />
      <Stars radius={80} depth={50} count={1500} factor={3} fade speed={0.5} />

      <group ref={groupRef}>
        {nodes.map((n, i) => (
          <FloatingNode key={i} {...n} />
        ))}
      </group>

      <EffectComposer>
        <Bloom intensity={0.4} luminanceThreshold={0.5} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export default function LandingScene() {
  return (
    <Canvas
      camera={{ position: [0, 2, 12], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.5]}
      style={{ background: '#0a0a0f' }}
    >
      <AutoRotateScene />
    </Canvas>
  );
}
