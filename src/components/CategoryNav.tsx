'use client';

import { categories } from '@/data/skills';
import { UserProgress } from '@/types';

interface CategoryNavProps {
  progress: UserProgress;
  activeCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryNav({
  progress,
  activeCategoryId,
  onSelectCategory,
}: CategoryNavProps) {
  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        top: '48px',
        bottom: 0,
        width: '220px',
        zIndex: 30,
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--border)',
        overflowY: 'auto',
        padding: '1.5rem 0',
      }}
    >
      {/* Overview */}
      <button
        onClick={() => onSelectCategory(null)}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '0.5rem 1.25rem',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.7rem',
          fontWeight: activeCategoryId === null ? 500 : 400,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: activeCategoryId === null ? 'var(--text-primary)' : 'var(--text-secondary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '0.75rem',
        }}
      >
        All Categories
      </button>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: 'var(--border)',
          margin: '0 1.25rem 0.75rem',
        }}
      />

      {categories.map((cat) => {
        const total = cat.skills.length;
        const done = cat.skills.filter((s) => progress[s.id]?.completed).length;
        const isActive = activeCategoryId === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '0.5rem 1.25rem',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.78rem',
              fontWeight: 400,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-card)' : 'transparent',
              border: 'none',
              borderRight: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              marginBottom: '0.125rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                {cat.icon} {cat.name}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.65rem',
                  color: done === total && total > 0 ? 'var(--accent)' : 'var(--text-tertiary)',
                }}
              >
                {done}/{total}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
