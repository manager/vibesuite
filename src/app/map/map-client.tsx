'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { UserProgress } from '@/types';
import { categories, allSkills, getSkillById, getCategoryBySkillId } from '@/data/skills';
import ProgressHeader from '@/components/ProgressHeader';
import CategoryNav from '@/components/CategoryNav';
import SkillDetailPanel from '@/components/SkillDetailPanel';
import SkillCard from '@/components/SkillCard';
import CategoryIcon from '@/components/CategoryIcons';
import RecommendationModal from '@/components/RecommendationModal';
import { getRecommendations } from '@/lib/recommendations';

interface MapClientProps {
  initialProgress: UserProgress;
  userEmail: string;
}

export default function MapClient({ initialProgress, userEmail }: MapClientProps) {
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [focusCategoryId, setFocusCategoryId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [whyClosing, setWhyClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Escape key closes the "Why" modal
  useEffect(() => {
    if (!showWhyModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setWhyClosing(true);
        setTimeout(() => setShowWhyModal(false), 180);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showWhyModal]);

  const selectedSkill = selectedSkillId ? getSkillById(selectedSkillId) : null;
  const selectedCategory = selectedSkillId ? getCategoryBySkillId(selectedSkillId) : null;

  const { prevSkillId, nextSkillId } = useMemo(() => {
    if (!selectedSkillId) return { prevSkillId: null, nextSkillId: null };
    const idx = allSkills.findIndex((s) => s.id === selectedSkillId);
    return {
      prevSkillId: idx > 0 ? allSkills[idx - 1].id : null,
      nextSkillId: idx < allSkills.length - 1 ? allSkills[idx + 1].id : null,
    };
  }, [selectedSkillId]);

  const recommendations = useMemo(() => getRecommendations(progress, 3), [progress]);
  const allCompleted = useMemo(() => allSkills.every((s) => progress[s.id]?.completed), [progress]);

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

      // Close the detail panel when marking as learned
      if (completed) {
        setSelectedSkillId(null);
      }

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
    setTransitioning(true);
    setTimeout(() => {
      setFocusCategoryId(categoryId);
      if (categoryId && sectionRefs.current[categoryId]) {
        sectionRefs.current[categoryId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setTimeout(() => setTransitioning(false), 50);
    }, 150);
  }, []);

  // Filter categories by sidebar selection, then by search query
  const searchLower = searchQuery.toLowerCase().trim();
  const displayCategories = useMemo(() => {
    const base = focusCategoryId
      ? categories.filter((c) => c.id === focusCategoryId)
      : categories;
    if (!searchLower) return base;
    return base
      .map((cat) => ({
        ...cat,
        skills: cat.skills.filter((s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.projectTitle.toLowerCase().includes(searchLower) ||
          s.projectDescription.toLowerCase().includes(searchLower)
        ),
      }))
      .filter((cat) => cat.skills.length > 0);
  }, [focusCategoryId, searchLower]);

  return (
    <div style={{ minHeight: '100vh' }}>
      <ProgressHeader progress={progress} userEmail={userEmail} />

      {/* Desktop sidebar — fixed overlay, never pushes content */}
      <div className="hidden lg:block">
        <CategoryNav
          progress={progress}
          activeCategoryId={focusCategoryId}
          onSelectCategory={handleSelectCategory}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenRecommendations={() => setShowRecommendations(true)}
          allCompleted={allCompleted}
        />

        {/* Expand button — visible only when sidebar is collapsed */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            title="Expand sidebar"
            style={{
              position: 'fixed',
              left: '0.75rem',
              top: '70px',
              zIndex: 31,
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
            ›
          </button>
        )}
      </div>

      {/* Main content area — centered, sidebar overlays on top */}
      <main
        onClick={() => { if (selectedSkillId) setSelectedSkillId(null); }}
        style={{
          paddingTop: '58px',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: '2.5rem 2rem 4rem',
            opacity: transitioning ? 0 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {/* Page title */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--accent)', fontSize: '2.5rem', lineHeight: 1 }}>&#x2022;</span>
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
                Vibe Suite — AI Skill Guide
              </h1>
              <span style={{ color: 'var(--accent)', fontSize: '2.5rem', lineHeight: 1 }}>&#x2022;</span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
              }}
            >
              Your path from first prompt to shipped product
            </p>
            <button
              onClick={() => { setWhyClosing(false); setShowWhyModal(true); }}
              style={{
                marginTop: '0.5rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                fontStyle: 'italic',
                color: 'var(--text-tertiary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Why do I need this?
            </button>
          </div>

          {/* Search bar */}
          <div style={{ maxWidth: '300px', margin: '0 0 2.5rem', position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              style={{
                width: '100%',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                padding: '0.6rem 1rem',
                paddingRight: searchQuery ? '2.5rem' : '1rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.6rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8rem',
                  color: 'var(--text-tertiary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            )}
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
                    userSelect: 'none',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.65rem',
                      fontWeight: 500,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <CategoryIcon categoryId={cat.id} /> {cat.name}
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
                      userSelect: 'none',
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
                  onClick={(e) => e.stopPropagation()}
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
                      selected={selectedSkillId === skill.id}
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
          prevSkillId={prevSkillId}
          nextSkillId={nextSkillId}
        />
      )}

      {/* Recommendation modal */}
      {showRecommendations && recommendations.length > 0 && (
        <RecommendationModal
          recommendations={recommendations}
          onSelectSkill={(skillId) => {
            setShowRecommendations(false);
            handleSelectSkill(skillId);
          }}
          onClose={() => setShowRecommendations(false)}
        />
      )}

      {/* "Why do I need this?" modal */}
      {showWhyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: whyClosing ? 'rgba(28, 28, 26, 0)' : 'rgba(28, 28, 26, 0.35)',
            transition: 'background 0.2s ease',
          }}
          onClick={() => {
            setWhyClosing(true);
            setTimeout(() => setShowWhyModal(false), 180);
          }}
        >
          <div
            className={whyClosing ? 'animate-modal-out' : 'animate-modal-in'}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'calc(100% - 2rem)',
              maxWidth: '480px',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-strong)',
              padding: '1.75rem',
              overflow: 'hidden',
            }}
          >
            {/* Background images — subtle, cropped, desaturated via CSS */}
            {/* Open to work: top-left, high visibility */}
            <div
              style={{
                position: 'absolute',
                top: '-15px',
                left: '-20px',
                width: '180px',
                height: '180px',
                opacity: 0.25,
                pointerEvents: 'none',
                filter: 'grayscale(100%) contrast(1.1)',
                transform: 'rotate(-4deg)',
                maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 70%)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/why-bg-3.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {/* KFC: top-right, angled, bleeding off edge */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-30px',
                width: '200px',
                height: '200px',
                opacity: 0.17,
                pointerEvents: 'none',
                filter: 'grayscale(100%) contrast(1.2)',
                transform: 'rotate(8deg)',
                maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/why-bg-1.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {/* McDonalds: bottom-left, angled opposite, bleeding off edge */}
            <div
              style={{
                position: 'absolute',
                bottom: '-25px',
                left: '50%',
                transform: 'translateX(-50%) rotate(-6deg)',
                width: '220px',
                height: '220px',
                opacity: 0.16,
                pointerEvents: 'none',
                filter: 'grayscale(100%) contrast(1.2)',
                maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/why-bg-2.webp" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                  onClick={() => {
                    setWhyClosing(true);
                    setTimeout(() => setShowWhyModal(false), 180);
                  }}
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
              <div style={{ width: '2rem', height: '2px', background: 'var(--accent)', marginBottom: '1.5rem' }} />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.85, color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: '1rem' }}>
                  Most knowledge workers are becoming irrelevant. Not next year. Right now. Every single day.
                </p>
                <p style={{ marginBottom: '1rem' }}>
                  This isn&apos;t doom-scrolling anxiety&nbsp;&mdash; it&apos;s math. AI replaces tasks, tasks make up jobs, jobs disappear quietly while people argue on Twitter about whether it&apos;s &ldquo;really&rdquo; happening.
                </p>
                <p>
                  This skill map is your chance to stay relevant. Learn to build with AI&nbsp;&mdash; not compete against it&nbsp;&mdash; so that in your 30s and 40s you still get to choose what you do for a living.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
