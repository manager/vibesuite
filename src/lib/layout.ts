import { SkillCategory, NodePosition } from '@/types';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function computeCategoryPositions(
  categories: SkillCategory[],
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const n = categories.length;
  const radius = 20;

  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(n - 1, 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * i;

    positions.set(categories[i].id, {
      x: Math.cos(theta) * radiusAtY * radius,
      y: y * radius * 0.6,
      z: Math.sin(theta) * radiusAtY * radius,
    });
  }

  return positions;
}

export function computeSkillPositions(
  skills: { id: string }[],
  center: NodePosition,
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const localRadius = 2 + skills.length * 0.3;

  for (let i = 0; i < skills.length; i++) {
    const y = 1 - (i / Math.max(skills.length - 1, 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * i;

    positions.set(skills[i].id, {
      x: center.x + Math.cos(theta) * radiusAtY * localRadius,
      y: center.y + y * localRadius,
      z: center.z + Math.sin(theta) * radiusAtY * localRadius,
    });
  }

  return positions;
}

export interface FullLayout {
  categoryPositions: Map<string, NodePosition>;
  skillPositions: Map<string, NodePosition>;
}

export function computeFullLayout(categories: SkillCategory[]): FullLayout {
  const categoryPositions = computeCategoryPositions(categories);
  const skillPositions = new Map<string, NodePosition>();

  for (const category of categories) {
    const center = categoryPositions.get(category.id)!;
    const localPositions = computeSkillPositions(category.skills, center);
    for (const [id, pos] of localPositions) {
      skillPositions.set(id, pos);
    }
  }

  return { categoryPositions, skillPositions };
}
