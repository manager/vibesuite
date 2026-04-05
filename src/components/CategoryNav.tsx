'use client';

import { categories } from '@/data/skills';
import { UserProgress } from '@/types';
import CategoryIcon from './CategoryIcons';

interface CategoryNavProps {
  progress: UserProgress;
  activeCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenRecommendations: () => void;
  onOpenWhyModal: () => void;
  allCompleted: boolean;
}

export default function CategoryNav({
  progress,
  activeCategoryId,
  onSelectCategory,
  collapsed,
  onToggleCollapse,
  onOpenRecommendations,
  onOpenWhyModal,
  allCompleted,
}: CategoryNavProps) {
  return (
    <nav
      className="animate-sidebar"
      style={{
        position: 'fixed',
        left: 0,
        top: '58px',
        bottom: 0,
        width: '260px',
        zIndex: 50,
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--border)',
        overflowY: 'auto',
        padding: '1.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        transform: collapsed ? 'translateX(-260px)' : 'translateX(0)',
        transition: 'transform 0.25s ease',
      }}
    >
      {/* Top bar: title + collapse */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 1.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.6rem',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
          }}
        >
          Categories
        </span>
        <button
          onClick={onToggleCollapse}
          title="Collapse sidebar"
          style={{
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
            color: 'var(--text-secondary)',
            transition: 'border-color 0.15s, color 0.15s',
            padding: 0,
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
          ‹
        </button>
      </div>

      {/* Red accent rule */}
      <div style={{ width: '2rem', height: '2px', background: 'var(--accent)', margin: '0 1.75rem 1.25rem' }} />

      {/* What to Learn Next banner */}
      {!allCompleted && (
        <button
          onClick={onOpenRecommendations}
          style={{
            display: 'block',
            width: 'calc(100% - 3.5rem)',
            margin: '0 1.75rem 1.25rem',
            padding: '0.7rem 0.85rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderLeft: '2px solid var(--accent)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.background = 'var(--bg-card-active)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.borderLeftColor = 'var(--accent)';
            e.currentTarget.style.background = 'var(--bg-card)';
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              display: 'block',
              marginBottom: '0.15rem',
            }}
          >
            What to learn next?
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
            }}
          >
            Personalized for you
          </span>
        </button>
      )}

      {/* All Categories button */}
      <button
        onClick={() => onSelectCategory(null)}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '0.6rem 1.75rem',
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          fontWeight: activeCategoryId === null ? 500 : 400,
          color: activeCategoryId === null ? 'var(--accent)' : 'var(--text-secondary)',
          background: activeCategoryId === null ? 'var(--bg-card-active)' : 'transparent',
          border: 'none',
          borderLeft: activeCategoryId === null ? '3px solid var(--accent)' : '3px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          marginBottom: '0.25rem',
        }}
      >
        All Categories
      </button>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: 'var(--border)',
          margin: '0.5rem 1.75rem 0.5rem',
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
              padding: '0.6rem 1.75rem',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: 400,
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-card-active)' : 'transparent',
              border: 'none',
              borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              marginBottom: '0.125rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <CategoryIcon categoryId={cat.id} />
                {cat.name}
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

      {/* Bottom spacer + "Why do I need this?" */}
      <div style={{ flex: 1 }} />
      <div
        style={{
          padding: '1.25rem 1.75rem 0.5rem',
          borderTop: '1px solid var(--border)',
          marginTop: '1.25rem',
        }}
      >
        <button
          onClick={onOpenWhyModal}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.78rem',
            fontStyle: 'italic',
            color: 'var(--text-tertiary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            padding: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
        >
          Why do I need this?
        </button>
      </div>
    </nav>
  );
}
