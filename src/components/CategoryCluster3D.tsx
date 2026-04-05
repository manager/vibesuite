'use client';

import { Text, Line } from '@react-three/drei';
import SkillNode3D from './SkillNode3D';
import { SkillCategory, NodePosition, UserProgress } from '@/types';

interface CategoryCluster3DProps {
  category: SkillCategory;
  center: NodePosition;
  skillPositions: Map<string, NodePosition>;
  progress: UserProgress;
  onSelectSkill: (skillId: string) => void;
}

export default function CategoryCluster3D({
  category,
  center,
  skillPositions,
  progress,
  onSelectSkill,
}: CategoryCluster3DProps) {
  return (
    <group>
      {/* Category label */}
      <Text
        position={[center.x, center.y + 3.5, center.z]}
        fontSize={0.8}
        color={category.color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {category.icon} {category.name}
      </Text>

      {/* Skill nodes */}
      {category.skills.map((skill) => {
        const pos = skillPositions.get(skill.id);
        if (!pos) return null;

        return (
          <SkillNode3D
            key={skill.id}
            position={[pos.x, pos.y, pos.z]}
            color={category.color}
            name={skill.name}
            difficulty={skill.difficulty}
            completed={!!progress[skill.id]?.completed}
            onClick={() => onSelectSkill(skill.id)}
          />
        );
      })}

      {/* Dependency lines */}
      {category.skills.map((skill) =>
        skill.dependsOn?.map((depId) => {
          const from = skillPositions.get(depId);
          const to = skillPositions.get(skill.id);
          if (!from || !to) return null;

          const bothCompleted =
            !!progress[depId]?.completed && !!progress[skill.id]?.completed;

          return (
            <Line
              key={`${depId}-${skill.id}`}
              points={[
                [from.x, from.y, from.z],
                [to.x, to.y, to.z],
              ]}
              color={bothCompleted ? category.color : '#333333'}
              lineWidth={bothCompleted ? 2 : 1}
              dashed={!bothCompleted}
              dashScale={5}
              transparent
              opacity={bothCompleted ? 0.8 : 0.15}
            />
          );
        }),
      )}
    </group>
  );
}
