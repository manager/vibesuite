'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { UserProgress } from '@/types';
import { categories, getSkillById, getCategoryBySkillId } from '@/data/skills';
import ProgressHeader from '@/components/ProgressHeader';
import CategoryNav from '@/components/CategoryNav';
import SkillDetailPanel from '@/components/SkillDetailPanel';
import SkillCard from '@/components/SkillCard';

interface MapClientProps {
  initialProgress: UserProgress;
  userEmail: string;
}

export default function MapClient({ initialProgress, userEmail }: MapClientProps) {
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [focusCategoryId, setFocusCategoryId] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const selectedSkill = selectedSkillId ? getSkillById(selectedSkillId) : null;
  const selectedCategory = selectedSkillId ? getCategoryBySkillId(selectedSkillId) : null;

  const handleSelectSkill = useCallback((skillId: string) => {
    setSelectedSkillId(skillId);
  }, []);

  const handleToggle = useCallback(
    async (skillId: string, completed: boolean) => {
      setProgress((prev) => {
        const next = { ...prev };
        if (completed) {
          next[skillId] = { completed: true, completedAt: new Date().toISOString() };
        } else {
          delete next[skillId];
        }
        return next;
      });

      try {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillId, completed }),
        });
        if (!res.ok) setProgress(initialProgress);
      } catch {
        setProgress(initialProgress);
      }
    },
    [initialProgress],
  );

  const handleSelectCategory = useCallback((categoryId: string | null) => {
    setFocusCategoryId(categoryId);
    if (categoryId && sectionRefs.current[categoryId]) {
      sectionRefs.current[categoryId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const displayCategories = focusCategoryId
    ? categories.filter((c) => c.id === focusCategoryId)
    : categories;

  return (
    <div style={{ minHeight: '100vh' }}>
      <ProgressHeader progress={progress} userEmail={userEmail} />

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <CategoryNav
          progress={progress}
          activeCategoryId={focusCategoryId}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      {/* Main content area */}
      <main
        style={{
          paddingTop: '48px',
          paddingLeft: '0',
          minHeight: '100vh',
        }}
        className="lg:pl-[220px]"
      >
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
          {/* Page title */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>·</span>
              <h1
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                  fontWeight: 300,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                }}
              >
                Skill Map
              </h1>
              <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>·</span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
              }}
            >
              Your path from first prompt to shipped product
            </p>
          </div>

          {/* Category sections */}
          {displayCategories.map((cat) => {
            const total = cat.skills.length;
            const done = cat.skills.filter((s) => progress[s.id]?.completed).length;

            return (
              <section
                key={cat.id}
                ref={(el) => { sectionRefs.current[cat.id] = el; }}
                style={{ marginBottom: '3rem' }}
              >
                {/* Section header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat.icon} {cat.name}
                  </h2>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-strong)' }} />
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.65rem',
                      fontWeight: 500,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: done === total && total > 0 ? 'var(--accent)' : 'var(--text-tertiary)',
                      border: `1px solid ${done === total && total > 0 ? 'var(--accent)' : 'var(--border-strong)'}`,
                      padding: '0.25rem 0.75rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {done}/{total}
                  </span>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    fontStyle: 'italic',
                  }}
                >
                  {cat.description}
                </p>

                {/* Card grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 0,
                  }}
                >
                  {cat.skills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      category={cat}
                      completed={!!progress[skill.id]?.completed}
                      onClick={() => handleSelectSkill(skill.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Detail panel */}
      {selectedSkill && selectedCategory && (
        <SkillDetailPanel
          skill={selectedSkill}
          category={selectedCategory}
          progress={progress}
          onToggle={handleToggle}
          onClose={() => setSelectedSkillId(null)}
          onSelectSkill={handleSelectSkill}
        />
      )}
    </div>
  );
}
