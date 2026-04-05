'use client';

import { Skill, SkillCategory, UserProgress } from '@/types';
import { getDependencies } from '@/data/skills';

interface SkillDetailPanelProps {
  skill: Skill;
  category: SkillCategory;
  progress: UserProgress;
  onToggle: (skillId: string, completed: boolean) => void;
  onClose: () => void;
  onSelectSkill: (skillId: string) => void;
}

const difficultyDisplay: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: '#6B8E6B' },
  intermediate: { label: 'Intermediate', color: '#B8960B' },
  advanced: { label: 'Advanced', color: 'var(--accent)' },
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
  const diff = difficultyDisplay[skill.difficulty];

  return (
    <div className="animate-slide-in"
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100%',
        width: '100%',
        maxWidth: '420px',
        zIndex: 50,
      }}
    >
      <div
        style={{
          height: '100%',
          background: 'var(--bg-base)',
          borderLeft: '1px solid var(--border)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '2rem 1.75rem', flex: 1 }}>
          {/* Close + Category */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6rem',
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
              }}
            >
              {category.icon} {category.name}
            </span>
            <button
              onClick={onClose}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '1.1rem',
                color: 'var(--text-tertiary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Skill name */}
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 400,
              marginBottom: '1rem',
              lineHeight: 1.3,
            }}
          >
            {skill.name}
          </h2>

          {/* Difficulty + Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.65rem',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: diff.color,
                border: `1px solid ${diff.color}40`,
                padding: '0.2rem 0.6rem',
              }}
            >
              {diff.label}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.7rem',
                color: 'var(--text-tertiary)',
              }}
            >
              {skill.timeEstimate}
            </span>
          </div>

          {/* Red accent rule */}
          <div style={{ width: '2rem', height: '2px', background: 'var(--accent)', marginBottom: '1.25rem' }} />

          {/* What you'll build */}
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
              marginBottom: '0.35rem',
            }}
          >
            What you&apos;ll build
          </p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              lineHeight: 1.4,
            }}
          >
            {skill.projectTitle}
          </p>

          {/* Description */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              lineHeight: 1.75,
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
            }}
          >
            {skill.projectDescription}
          </p>

          {/* Tools */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6rem',
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                marginBottom: '0.5rem',
              }}
            >
              Tools
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {skill.tools.map((tool) => (
                <span
                  key={tool}
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.65rem',
                    padding: '0.2rem 0.6rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Dependencies */}
          {deps.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.5rem',
                }}
              >
                Prerequisites
              </p>
              {deps.map((dep) => {
                const depDone = !!progress[dep.id]?.completed;
                return (
                  <button
                    key={dep.id}
                    onClick={() => onSelectSkill(dep.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      color: depDone ? 'var(--accent)' : 'var(--text-secondary)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem 0',
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    <span>{depDone ? '✓' : '○'}</span>
                    {dep.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Toggle button — pinned to bottom */}
        <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => onToggle(skill.id, !isCompleted)}
            style={{
              width: '100%',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.7rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '0.75rem 0',
              border: isCompleted ? '1px solid var(--border-strong)' : '1px solid var(--accent)',
              background: isCompleted ? 'transparent' : 'var(--accent)',
              color: isCompleted ? 'var(--text-secondary)' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isCompleted ? 'Unmark as Learned' : 'Mark as Learned'}
          </button>
        </div>
      </div>
    </div>
  );
}
