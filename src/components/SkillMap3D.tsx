'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { categories } from '@/data/skills';
import { computeFullLayout } from '@/lib/layout';
import { UserProgress } from '@/types';
import CategoryCluster3D from './CategoryCluster3D';

interface SkillMap3DProps {
  progress: UserProgress;
  onSelectSkill: (skillId: string) => void;
  focusCategoryId: string | null;
}

function CameraController({ focusCategoryId }: { focusCategoryId: string | null }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const targetPosition = useRef(new THREE.Vector3(0, 10, 40));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimating = useRef(false);

  const layout = useMemo(() => computeFullLayout(categories), []);

  useEffect(() => {
    if (!focusCategoryId) {
      targetPosition.current.set(0, 10, 40);
      targetLookAt.current.set(0, 0, 0);
      isAnimating.current = true;
      return;
    }

    const center = layout.categoryPositions.get(focusCategoryId);
    if (!center) return;

    // Position camera offset from cluster center
    const dir = new THREE.Vector3(center.x, center.y, center.z).normalize();
    targetPosition.current.set(
      center.x + dir.x * 10,
      center.y + 4,
      center.z + dir.z * 10,
    );
    targetLookAt.current.set(center.x, center.y, center.z);
    isAnimating.current = true;
  }, [focusCategoryId, layout]);

  useFrame(() => {
    if (!isAnimating.current) return;

    camera.position.lerp(targetPosition.current, 0.03);
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(10).add(camera.position);
    currentLookAt.lerp(targetLookAt.current, 0.03);
    camera.lookAt(targetLookAt.current);

    if (camera.position.distanceTo(targetPosition.current) < 0.1) {
      isAnimating.current = false;
    }

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.03);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={80}
    />
  );
}

function SceneContent({
  progress,
  onSelectSkill,
  focusCategoryId,
}: SkillMap3DProps) {
  const layout = useMemo(() => computeFullLayout(categories), []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[20, 20, 20]} intensity={0.5} />
      <pointLight position={[-20, -10, -20]} intensity={0.3} />

      <Stars radius={100} depth={50} count={2000} factor={4} fade speed={1} />

      <CameraController focusCategoryId={focusCategoryId} />

      {categories.map((category) => {
        const center = layout.categoryPositions.get(category.id);
        if (!center) return null;

        return (
          <CategoryCluster3D
            key={category.id}
            category={category}
            center={center}
            skillPositions={layout.skillPositions}
            progress={progress}
            onSelectSkill={onSelectSkill}
          />
        );
      })}

      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function SkillMap3D(props: SkillMap3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 10, 40], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.5]}
      style={{ background: '#0a0a0f' }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
