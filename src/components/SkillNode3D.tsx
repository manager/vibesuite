'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Difficulty } from '@/types';

interface SkillNode3DProps {
  position: [number, number, number];
  color: string;
  name: string;
  difficulty: Difficulty;
  completed: boolean;
  onClick: () => void;
}

export default function SkillNode3D({
  position,
  color,
  name,
  difficulty,
  completed,
  onClick,
}: SkillNode3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;

    if (completed) {
      const t = Date.now() * 0.003;
      meshRef.current.scale.setScalar(1 + Math.sin(t) * 0.08);
    } else {
      const target = hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.1);
    }
  });

  const isAdvanced = difficulty === 'advanced';
  const size = isAdvanced ? 0.5 : 0.4;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {isAdvanced ? (
          <octahedronGeometry args={[size]} />
        ) : (
          <sphereGeometry args={[size, 16, 16]} />
        )}

        {completed ? (
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            wireframe
            transparent
            opacity={hovered ? 0.6 : 0.25}
          />
        )}
      </mesh>

      {hovered && (
        <Html
          distanceFactor={12}
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div className="bg-black/90 text-white text-xs px-2 py-1 rounded border border-white/20 backdrop-blur-sm">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}
