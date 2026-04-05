'use client';

import { useState, useEffect } from 'react';
import { Recommendation } from '@/types';
import { getCategoryBySkillId } from '@/data/skills';
import CategoryIcon from './CategoryIcons';
import SkillIcon from './SkillIcons';

interface RecommendationModalProps {
  recommendations: Recommendation[];
  onSelectSkill: (skillId: string) => void;
  onClose: () => void;
}

const difficultyColor: Record<string, string> = {
  beginner: '#6B8E6B',
  intermediate: '#B8960B',
  advanced: '#B83232',
};

export default function RecommendationModal({
  recommendations,
  onSelectSkill,
  onClose,
}: RecommendationModalProps) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 180);
  };

  const handleSelect = (skillId: string) => {
    setClosing(true);
    setTimeout(() => onSelectSkill(skillId), 180);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: closing ? 'rgba(28, 28, 26, 0)' : 'rgba(28, 28, 26, 0.35)',
        transition: 'background 0.2s ease',
      }}
      onClick={handleClose}
    >
      <div
        className={closing ? 'animate-modal-out' : 'animate-modal-in'}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'calc(100% - 2rem)',
          maxWidth: '440px',
          background: 'var(--bg-base)',
          border: '1px solid var(--border-strong)',
          padding: '1.75rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
            }}
          >
            What to learn next
          </span>
          <button
            onClick={handleClose}
            title="Close"
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
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Red accent rule */}
        <div
          style={{
            width: '2rem',
            height: '2px',
            background: 'var(--accent)',
            marginBottom: '1.5rem',
          }}
        />

        {/* Recommendation cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recommendations.map((rec) => {
            const cat = getCategoryBySkillId(rec.skill.id);
            const dColor = difficultyColor[rec.skill.difficulty] || 'var(--text-tertiary)';

            return (
              <button
                key={rec.skill.id}
                onClick={() => handleSelect(rec.skill.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '1rem 1.1rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--bg-card-active)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg-card)';
                }}
              >
                {/* Category + difficulty row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.4rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.6rem',
                      fontWeight: 500,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--text-tertiary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    {cat && <CategoryIcon categoryId={cat.id} />}
                    {cat?.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.6rem',
                        fontWeight: 500,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: dColor,
                      }}
                    >
                      {rec.skill.difficulty}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.6rem',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      {rec.skill.timeEstimate}
                    </span>
                  </div>
                </div>

                {/* Skill name */}
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    color: 'var(--text-primary)',
                    marginBottom: '0.3rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                    <SkillIcon skillId={rec.skill.id} />
                  </span>
                  {rec.skill.name}
                </p>

                {/* Reason */}
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.65rem',
                    color: 'var(--accent)',
                    paddingLeft: '1.35rem',
                  }}
                >
                  {rec.reasonText}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
