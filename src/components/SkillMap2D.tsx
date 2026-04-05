'use client';

import { useState } from 'react';
import { categories } from '@/data/skills';
import { UserProgress, SkillCategory, Skill } from '@/types';

interface SkillMap2DProps {
  progress: UserProgress;
  onSelectSkill: (skillId: string) => void;
}

const difficultyColors = {
  beginner: 'border-green-500/30 text-green-400',
  intermediate: 'border-yellow-500/30 text-yellow-400',
  advanced: 'border-red-500/30 text-red-400',
};

export default function SkillMap2D({ progress, onSelectSkill }: SkillMap2DProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {categories.map((cat) => {
        const total = cat.skills.length;
        const done = cat.skills.filter((s) => progress[s.id]?.completed).length;
        const isExpanded = expandedCategory === cat.id;

        return (
          <div
            key={cat.id}
            className="rounded-xl border border-white/5 overflow-hidden"
            style={{
              boxShadow: done > 0 ? `0 0 20px ${cat.color}10` : undefined,
            }}
          >
            {/* Category header */}
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.icon}</span>
                <div className="text-left">
                  <div className="text-sm font-medium">{cat.name}</div>
                  <div className="text-xs text-white/40">{cat.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/50">{done}/{total}</span>
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(done / total) * 100}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
                <span className="text-white/30 text-sm">{isExpanded ? '▼' : '▶'}</span>
              </div>
            </button>

            {/* Skills list */}
            {isExpanded && (
              <div className="border-t border-white/5 p-2 space-y-1">
                {cat.skills.map((skill) => {
                  const completed = !!progress[skill.id]?.completed;

                  return (
                    <button
                      key={skill.id}
                      onClick={() => onSelectSkill(skill.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                    >
                      <span className={completed ? 'text-green-400' : 'text-white/20'}>
                        {completed ? '✓' : '○'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white/80 truncate">{skill.name}</div>
                        <div className="text-xs text-white/40 truncate">{skill.projectTitle}</div>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${difficultyColors[skill.difficulty]}`}
                      >
                        {skill.difficulty}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
