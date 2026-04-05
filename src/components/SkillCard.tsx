'use client';

import { useState } from 'react';
import { Skill, SkillCategory } from '@/types';
import SkillIcon from './SkillIcons';

// Map first letter to katakana
const KATAKANA_MAP: Record<string, string> = {
  a: 'ア', b: 'ビ', c: 'ク', d: 'デ', e: 'エ', f: 'フ', g: 'グ', h: 'ハ',
  i: 'イ', j: 'ジ', k: 'カ', l: 'ル', m: 'マ', n: 'ナ', o: 'オ', p: 'プ',
  q: 'ク', r: 'ラ', s: 'サ', t: 'タ', u: 'ウ', v: 'ヴ', w: 'ワ', x: 'シ',
  y: 'ヤ', z: 'ズ',
};

function getKatakana(name: string): string {
  const first = name.charAt(0).toLowerCase();
  return KATAKANA_MAP[first] || 'ス';
}

const difficultyLabel: Record<string, string> = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
};

interface SkillCardProps {
  skill: Skill;
  category: SkillCategory;
  completed: boolean;
  selected: boolean;
  onClick: () => void;
}

export default function SkillCard({ skill, category, completed, selected, onClick }: SkillCardProps) {
  const katakana = getKatakana(skill.name);
  const highlighted = completed || selected;
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '1.25rem 0.75rem 1rem',
        minHeight: '120px',
        background: highlighted ? 'var(--bg-card-active)' : 'var(--bg-card)',
        border: `1px solid ${highlighted ? 'var(--accent)' : 'var(--border)'}`,
        overflow: 'visible',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, background 0.2s ease',
        margin: '-0.5px',
        textAlign: 'center',
        width: '100%',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        setShowTip(true);
        if (!highlighted) {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.background = 'var(--bg-card-active)';
        }
      }}
      onMouseLeave={(e) => {
        setShowTip(false);
        if (!highlighted) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.background = 'var(--bg-card)';
        }
      }}
    >
      {/* Custom tooltip */}
      <div
        style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: `translateX(-50%) translateY(${showTip ? '-4px' : '0px'})`,
          opacity: showTip ? 1 : 0,
          pointerEvents: 'none',
          zIndex: 20,
          fontFamily: 'var(--font-body)',
          fontSize: '0.78rem',
          lineHeight: 1.4,
          color: 'var(--text-primary)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          padding: '0.35rem 0.7rem',
          width: 'max-content',
          maxWidth: '280px',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        {skill.projectTitle}
      </div>

      {/* Kanji watermark — top-right corner, red tint */}
      <span
        style={{
          position: 'absolute',
          top: '0.25rem',
          right: '0.4rem',
          fontFamily: 'var(--font-japanese)',
          fontSize: '1.6rem',
          color: completed
            ? 'var(--accent-kanji-active)'
            : 'var(--accent-kanji)',
          lineHeight: 1,
          userSelect: 'none',
          transition: 'color 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        aria-hidden="true"
      >
        {katakana}
      </span>

      {/* Learned indicator — accent bar at top */}
      {completed && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'var(--accent)',
          }}
        />
      )}

      {/* Top-left: skill icon OR checkmark when learned */}
      <span
        style={{
          position: 'absolute',
          top: '0.5rem',
          left: '0.5rem',
          fontSize: completed ? '0.6rem' : '0.9rem',
          color: completed ? '#fff' : 'var(--text-secondary)',
          background: completed ? 'var(--accent)' : 'none',
          width: completed ? '16px' : 'auto',
          height: completed ? '16px' : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-ui)',
          fontWeight: 600,
        }}
      >
        {completed ? '✓' : <SkillIcon skillId={skill.id} />}
      </span>

      {/* Skill name */}
      <p
        style={{
          position: 'relative',
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          fontWeight: 400,
          color: completed ? 'var(--accent)' : 'var(--text-primary)',
          lineHeight: 1.3,
          marginBottom: '0.25rem',
        }}
      >
        {skill.name}
      </p>

      {/* Difficulty */}
      <p
        style={{
          position: 'relative',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.65rem',
          fontWeight: 400,
          color: 'var(--text-secondary)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {difficultyLabel[skill.difficulty]}
      </p>
    </div>
  );
}
