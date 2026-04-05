'use client';

import { signOut } from 'next-auth/react';
import { categories, getTotalSkillCount } from '@/data/skills';
import { UserProgress } from '@/types';

interface ProgressHeaderProps {
  progress: UserProgress;
  userEmail: string;
}

export default function ProgressHeader({ progress, userEmail }: ProgressHeaderProps) {
  const total = getTotalSkillCount();
  const completed = Object.values(progress).filter((p) => p.completed).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border)',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 2rem',
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.85rem',
          fontWeight: 400,
          letterSpacing: '0.02em',
          color: 'var(--text-primary)',
          marginRight: 'auto',
        }}
      >
        <strong style={{ fontWeight: 600 }}>vibe</strong>code
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}
        >
          {completed}
          <span style={{ color: 'var(--text-tertiary)' }}> / {total} skills</span>
          <span style={{ color: 'var(--text-tertiary)', marginLeft: '0.35rem' }}>({pct}%)</span>
        </span>

        {/* Progress bar */}
        <div
          style={{
            width: '100px',
            height: '3px',
            background: 'var(--border)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: 'var(--accent)',
              transition: 'width 0.5s ease',
            }}
          />
        </div>

        {/* User */}
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.7rem',
            color: 'var(--text-tertiary)',
          }}
        >
          {userEmail}
        </span>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.65rem',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            background: 'none',
            border: '1px solid var(--border)',
            padding: '0.25rem 0.75rem',
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
