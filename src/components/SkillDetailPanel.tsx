'use client';

import { Skill, SkillCategory, UserProgress } from '@/types';
import { getDependencies, getSkillById } from '@/data/skills';

interface SkillDetailPanelProps {
  skill: Skill;
  category: SkillCategory;
  progress: UserProgress;
  onToggle: (skillId: string, completed: boolean) => void;
  onClose: () => void;
  onSelectSkill: (skillId: string) => void;
}

const difficultyConfig = {
  beginner: { label: 'Beginner', color: 'bg-green-500/20 text-green-400 border-green-500/30', dot: '🟢' },
  intermediate: { label: 'Intermediate', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: '🟡' },
  advanced: { label: 'Advanced', color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: '🔴' },
};

export default function SkillDetailPanel({
  skill,
  category,
  progress,
  onToggle,
  onClose,
  onSelectSkill,
}: SkillDetailPanelProps) {
  const isCompleted = !!progress[skill.id]?.completed;
  const deps = getDependencies(skill.id);
  const diff = difficultyConfig[skill.difficulty];

  // Check if all dependencies are met
  const depsUnmet = deps.filter((d) => !progress[d.id]?.completed);

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 animate-slide-in">
      <div
        className="h-full bg-black/85 backdrop-blur-xl border-l-2 overflow-y-auto"
        style={{ borderColor: category.color }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div
              className="text-xs font-medium px-2 py-1 rounded-full border"
              style={{
                color: category.color,
                borderColor: category.color + '40',
                backgroundColor: category.color + '15',
              }}
            >
              {category.icon} {category.name}
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors text-xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Skill name */}
          <h2 className="text-xl font-bold mb-4">{skill.name}</h2>

          {/* Difficulty + Time */}
          <div className="flex items-center gap-3 mb-5">
            <span className={`text-xs px-2 py-1 rounded border ${diff.color}`}>
              {diff.dot} {diff.label}
            </span>
            <span className="text-xs text-white/50">⏱ {skill.timeEstimate}</span>
          </div>

          {/* Project title */}
          <div className="mb-4">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
              What you&apos;ll build
            </div>
            <div className="text-sm font-medium text-white/90">{skill.projectTitle}</div>
          </div>

          {/* Description */}
          <p className="text-sm text-white/60 leading-relaxed mb-5">
            {skill.projectDescription}
          </p>

          {/* Tools */}
          <div className="mb-5">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Tools</div>
            <div className="flex flex-wrap gap-2">
              {skill.tools.map((tool) => (
                <span
                  key={tool}
                  className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-white/70"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Dependencies */}
          {deps.length > 0 && (
            <div className="mb-6">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
                Prerequisites
              </div>
              <div className="space-y-1">
                {deps.map((dep) => {
                  const depCompleted = !!progress[dep.id]?.completed;
                  return (
                    <button
                      key={dep.id}
                      onClick={() => onSelectSkill(dep.id)}
                      className="flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors w-full text-left"
                    >
                      <span className={depCompleted ? 'text-green-400' : 'text-white/30'}>
                        {depCompleted ? '✓' : '○'}
                      </span>
                      {dep.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Toggle button */}
          <button
            onClick={() => onToggle(skill.id, !isCompleted)}
            className="w-full py-3 rounded-lg font-medium text-sm transition-all"
            style={
              isCompleted
                ? {
                    background: 'transparent',
                    border: `1px solid ${category.color}40`,
                    color: category.color,
                  }
                : {
                    background: category.color,
                    color: '#000',
                  }
            }
          >
            {isCompleted ? 'Unmark as Learned' : 'Mark as Learned ✓'}
          </button>

          {depsUnmet.length > 0 && !isCompleted && (
            <p className="text-xs text-yellow-500/70 mt-2 text-center">
              Tip: complete prerequisites first for the best learning path
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
