'use client';

import { Skill, SkillCategory, UserProgress } from '@/types';

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
  onClick: () => void;
}

export default function SkillCard({ skill, category, completed, onClick }: SkillCardProps) {
  const katakana = getKatakana(skill.name);

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '1.25rem 0.75rem 1rem',
        minHeight: '120px',
        background: completed ? 'var(--bg-card-active)' : 'var(--bg-card)',
        border: `1px solid ${completed ? 'var(--accent)' : 'var(--border)'}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, background 0.2s ease',
        margin: '-0.5px',
        textAlign: 'center',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        if (!completed) {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.background = 'var(--bg-card-active)';
        }
      }}
      onMouseLeave={(e) => {
        if (!completed) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.background = 'var(--bg-card)';
        }
      }}
    >
      {/* Kanji watermark */}
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'var(--font-japanese)',
          fontSize: '3.5rem',
          color: completed ? 'var(--accent-kanji-active)' : 'var(--accent-kanji)',
          lineHeight: 1,
          userSelect: 'none',
          transition: 'color 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        aria-hidden="true"
      >
        {katakana}
      </span>

      {/* Completed check */}
      {completed && (
        <span
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            fontSize: '0.65rem',
            color: 'var(--accent)',
            fontFamily: 'var(--font-ui)',
            fontWeight: 600,
          }}
        >
          ✓
        </span>
      )}

      {/* Skill name */}
      <p
        style={{
          position: 'relative',
          fontFamily: 'var(--font-display)',
          fontSize: '0.85rem',
          fontWeight: 500,
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
          fontSize: '0.6rem',
          fontWeight: 300,
          color: 'var(--text-tertiary)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {difficultyLabel[skill.difficulty]}
      </p>
    </button>
  );
}
