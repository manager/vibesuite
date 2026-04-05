'use client';

import { useState, useEffect } from 'react';
import { Skill, SkillCategory, UserProgress } from '@/types';
import { getDependencies, getSkillById } from '@/data/skills';
import CategoryIcon from './CategoryIcons';
import SkillIcon from './SkillIcons';

interface SkillDetailPanelProps {
  skill: Skill;
  category: SkillCategory;
  progress: UserProgress;
  onToggle: (skillId: string, completed: boolean) => void;
  onClose: () => void;
  onSelectSkill: (skillId: string) => void;
  prevSkillId: string | null;
  nextSkillId: string | null;
}

const difficultyDisplay: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: '#6B8E6B' },
  intermediate: { label: 'Intermediate', color: '#B8960B' },
  advanced: { label: 'Advanced', color: 'var(--accent)' },
};

function buildInstruction(skill: Skill): string {
  // Convert project title to first-person: "your" → "my", "you" → "I"
  const title = skill.projectTitle
    .replace(/\byour\b/gi, 'my')
    .replace(/\byou\b/gi, 'I');
  const lower = title.charAt(0).toLowerCase() + title.slice(1);
  return `I want to learn "${skill.name}" to know how to ${lower}. Can we do it in my project?`;
}

const navBtnStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-strong)',
  cursor: 'pointer',
  fontFamily: 'var(--font-ui)',
  fontSize: '1rem',
  color: 'var(--text-primary)',
  transition: 'border-color 0.15s, color 0.15s',
  padding: 0,
  flexShrink: 0,
};

const navBtnDisabledStyle: React.CSSProperties = {
  ...navBtnStyle,
  color: 'var(--text-tertiary)',
  borderColor: 'var(--border)',
  cursor: 'default',
  opacity: 0.4,
};

// Shared label style for section headers
const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.65rem',
  fontWeight: 500,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: 'var(--text-tertiary)',
  marginBottom: '0.5rem',
};

export default function SkillDetailPanel({
  skill,
  category,
  progress,
  onToggle,
  onClose,
  onSelectSkill,
  prevSkillId,
  nextSkillId,
}: SkillDetailPanelProps) {
  const isCompleted = !!progress[skill.id]?.completed;
  const deps = getDependencies(skill.id);
  const diff = difficultyDisplay[skill.difficulty];
  const instruction = buildInstruction(skill);
  const [copied, setCopied] = useState(false);
  const [closing, setClosing] = useState(false);

  const prevSkill = prevSkillId ? getSkillById(prevSkillId) : null;
  const nextSkill = nextSkillId ? getSkillById(nextSkillId) : null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(instruction);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = instruction;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={closing ? 'animate-slide-out' : 'animate-slide-in'}
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
        <div style={{ padding: '1.5rem 1.75rem', flex: 1 }}>
          {/* Top bar: prev/next arrows + close */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => prevSkillId && onSelectSkill(prevSkillId)}
                disabled={!prevSkillId}
                title={prevSkill ? `Previous: ${prevSkill.name}` : undefined}
                style={prevSkillId ? navBtnStyle : navBtnDisabledStyle}
                onMouseEnter={(e) => {
                  if (prevSkillId) {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (prevSkillId) {
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
              >
                ‹
              </button>
              <button
                onClick={() => nextSkillId && onSelectSkill(nextSkillId)}
                disabled={!nextSkillId}
                title={nextSkill ? `Next: ${nextSkill.name}` : undefined}
                style={nextSkillId ? navBtnStyle : navBtnDisabledStyle}
                onMouseEnter={(e) => {
                  if (nextSkillId) {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (nextSkillId) {
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
              >
                ›
              </button>
            </div>

            <button
              onClick={handleClose}
              title="Close panel"
              style={{
                ...navBtnStyle,
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              ✕
            </button>
          </div>

          {/* Category label */}
          <span
            style={{
              ...sectionLabel,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)',
            }}
          >
            <CategoryIcon categoryId={category.id} /> {category.name}
          </span>

          {/* Skill name with icon */}
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 400,
              marginBottom: '1rem',
              lineHeight: 1.3,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
              <SkillIcon skillId={skill.id} />
            </span>
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
                fontSize: '0.65rem',
                color: 'var(--text-tertiary)',
              }}
            >
              {skill.timeEstimate}
            </span>
          </div>

          {/* Red accent rule */}
          <div style={{ width: '2rem', height: '2px', background: 'var(--accent)', marginBottom: '1.25rem' }} />

          {/* What you'll build */}
          <p style={sectionLabel}>
            What you&apos;ll build
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              fontWeight: 400,
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
              fontSize: '0.85rem',
              lineHeight: 1.75,
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
            }}
          >
            {skill.projectDescription}
          </p>

          {/* Tools */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={sectionLabel}>Tools</p>
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
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={sectionLabel}>Prerequisites</p>
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

          {/* LLM Instruction block */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={sectionLabel}>Paste this instruction to your project</p>
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                padding: '0.85rem 1rem',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                {instruction}
              </p>
            </div>
            <button
              onClick={handleCopy}
              style={{
                marginTop: '0.5rem',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.65rem',
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: copied ? '#fff' : 'var(--accent)',
                background: copied ? 'var(--accent)' : 'transparent',
                border: '1px solid var(--accent)',
                padding: '0.4rem 1rem',
                cursor: 'pointer',
              }}
            >
              {copied ? 'Copied!' : 'Copy Instruction'}
            </button>
          </div>
        </div>

        {/* Toggle button — pinned to bottom */}
        <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => onToggle(skill.id, !isCompleted)}
            style={{
              width: '100%',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.65rem',
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
