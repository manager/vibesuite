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
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideClosing, setGuideClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState<'all' | 'learned' | 'not-learned'>('all');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Escape key closes modals
  useEffect(() => {
    if (!showWhyModal && !showGuideModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showWhyModal) {
          setWhyClosing(true);
          setTimeout(() => setShowWhyModal(false), 180);
        }
        if (showGuideModal) {
          setGuideClosing(true);
          setTimeout(() => setShowGuideModal(false), 180);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showWhyModal, showGuideModal]);

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

  // Filter categories by sidebar selection, search query, and learned/not-learned filter
  const searchLower = searchQuery.toLowerCase().trim();
  const displayCategories = useMemo(() => {
    const base = focusCategoryId
      ? categories.filter((c) => c.id === focusCategoryId)
      : categories;
    return base
      .map((cat) => ({
        ...cat,
        skills: cat.skills.filter((s) => {
          // Search filter
          if (searchLower && !(
            s.name.toLowerCase().includes(searchLower) ||
            s.projectTitle.toLowerCase().includes(searchLower) ||
            s.projectDescription.toLowerCase().includes(searchLower)
          )) return false;
          // Learned/not-learned filter
          if (showFilter === 'learned' && !progress[s.id]?.completed) return false;
          if (showFilter === 'not-learned' && progress[s.id]?.completed) return false;
          return true;
        }),
      }))
      .filter((cat) => cat.skills.length > 0);
  }, [focusCategoryId, searchLower, showFilter, progress]);

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
          onOpenWhyModal={() => { setWhyClosing(false); setShowWhyModal(true); }}
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
              onClick={() => { setGuideClosing(false); setShowGuideModal(true); }}
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
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              First time? Click here
            </button>
          </div>

          {/* Search bar + filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '0 0 2.5rem', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: '300px', position: 'relative', flex: '0 0 auto' }}>
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

            {/* Show filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                Show
              </span>
              {(['all', 'learned', 'not-learned'] as const).map((opt) => {
                const label = opt === 'all' ? 'All' : opt === 'learned' ? 'Learned' : 'Not Learned';
                const isActive = showFilter === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      if (opt !== showFilter) {
                        setTransitioning(true);
                        setTimeout(() => {
                          setShowFilter(opt);
                          setTimeout(() => setTransitioning(false), 50);
                        }, 150);
                      }
                    }}
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.65rem',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      padding: '0.3rem 0.7rem',
                      background: isActive ? 'var(--accent)' : 'transparent',
                      border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-strong)'}`,
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.color = 'var(--accent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--border-strong)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
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

      {/* Guide overlay — 1:1 replica of actual UI with annotations */}
      {showGuideModal && (() => {
        const guideCategory = categories[0];
        const guideSkill = guideCategory.skills[0];
        const guideKatakana = (() => {
          const map: Record<string, string> = { a:'ア',b:'ビ',c:'ク',d:'デ',e:'エ',f:'フ',g:'グ',h:'ハ',i:'イ',j:'ジ',k:'カ',l:'ル',m:'マ',n:'ナ',o:'オ',p:'プ',q:'ク',r:'ラ',s:'サ',t:'タ',u:'ウ',v:'ヴ',w:'ワ',x:'シ',y:'ヤ',z:'ズ' };
          return map[guideSkill.name.charAt(0).toLowerCase()] || 'ス';
        })();
        const closeGuide = () => { setGuideClosing(true); setTimeout(() => setShowGuideModal(false), 180); };

        return (
        <div
          className={guideClosing ? 'animate-modal-out' : 'animate-modal-in'}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70,
            background: 'var(--bg-base)',
            overflow: 'hidden',
          }}
          onClick={closeGuide}
        >
          {/* Top navbar — replica of ProgressHeader */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              height: '58px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 2rem',
              background: 'var(--bg-base)',
              position: 'relative',
              zIndex: 3,
            }}
          >
            <div>
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6rem',
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
              }}>
                How this works
              </span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.95rem',
                fontWeight: 400,
                color: 'var(--text-primary)',
                marginLeft: '1rem',
              }}>
                Your AI does the teaching. This map tells it what.
              </span>
            </div>
            <button
              onClick={closeGuide}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.65rem',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '0.45rem 1.2rem',
                background: 'var(--accent)',
                border: '1px solid var(--accent)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#9A2A2A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
            >
              Got it
            </button>
          </div>

          {/* Main layout — 1:1 replica */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', height: 'calc(100vh - 58px)' }}
          >
            {/* LEFT PANEL — real category list */}
            <div style={{
              width: '260px',
              flexShrink: 0,
              background: 'var(--bg-base)',
              borderRight: '1px solid var(--border)',
              padding: '1.5rem 0',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              position: 'relative',
            }}>
              {/* Category header */}
              <div style={{ padding: '0 1.75rem', marginBottom: '1rem' }}>
                <span style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                }}>
                  Categories
                </span>
              </div>
              <div style={{ width: '2rem', height: '2px', background: 'var(--accent)', margin: '0 1.75rem 1rem' }} />

              {/* "What to learn next" banner */}
              <div style={{
                margin: '0 1.75rem 1rem',
                padding: '0.7rem 0.85rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderLeft: '2px solid var(--accent)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  display: 'block',
                  marginBottom: '0.15rem',
                }}>What to learn next?</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Personalized for you
                </span>
              </div>

              {/* Real category items */}
              <button style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.6rem 1.75rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                fontWeight: 500, color: 'var(--accent)', background: 'var(--bg-card-active)',
                border: 'none', borderLeft: '3px solid var(--accent)', cursor: 'default', marginBottom: '0.25rem',
              }}>
                All Categories
              </button>
              <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 1.75rem' }} />
              {categories.map((cat, i) => {
                const total = cat.skills.length;
                const done = cat.skills.filter((s) => progress[s.id]?.completed).length;
                return (
                  <div key={cat.id} style={{
                    padding: '0.6rem 1.75rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                    color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between',
                    borderLeft: '3px solid transparent',
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CategoryIcon categoryId={cat.id} /> {cat.name}
                    </span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                      {done}/{total}
                    </span>
                  </div>
                );
              })}

              {/* Annotation — Navigate */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '1rem',
                right: '1rem',
                transform: 'translateY(-50%)',
                zIndex: 5,
              }}>
                <div style={{
                  background: 'var(--bg-base)',
                  border: '2px solid var(--accent)',
                  borderLeft: '4px solid var(--accent)',
                  padding: '1rem 1.1rem',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 500,
                    letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)',
                    marginBottom: '0.4rem',
                  }}>Navigate</p>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-primary)',
                    lineHeight: 1.55,
                  }}>
                    Filter by category. &ldquo;What to learn next?&rdquo; recommends your next move.
                  </p>
                </div>
              </div>

              {/* Dim overlay on panel content */}
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(244, 239, 230, 0.75)',
                pointerEvents: 'none', zIndex: 4,
              }} />
            </div>

            {/* CENTER — real skill cards */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '2rem',
              position: 'relative',
            }}>
              {/* Real content behind */}
              <div style={{ maxWidth: '960px', margin: '0 auto' }}>
                {/* Page title */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--accent)', fontSize: '2.5rem', lineHeight: 1 }}>&#x2022;</span>
                    <h1 style={{
                      fontFamily: 'var(--font-ui)', fontSize: '1.5rem', fontWeight: 300,
                      letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-primary)',
                    }}>Vibe Suite — AI Skill Guide</h1>
                    <span style={{ color: 'var(--accent)', fontSize: '2.5rem', lineHeight: 1 }}>&#x2022;</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Your path from first prompt to shipped product
                  </p>
                </div>

                {/* First two categories with real cards */}
                {categories.slice(0, 2).map((cat) => {
                  const total = cat.skills.length;
                  const done = cat.skills.filter((s) => progress[s.id]?.completed).length;
                  return (
                    <section key={cat.id} style={{ marginBottom: '2.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', userSelect: 'none' }}>
                        <h2 style={{
                          fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 500,
                          letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-primary)',
                          whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        }}>
                          <CategoryIcon categoryId={cat.id} /> {cat.name}
                        </h2>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-strong)' }} />
                        <span style={{
                          fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 500,
                          letterSpacing: '0.15em', color: 'var(--text-tertiary)',
                          border: '1px solid var(--border-strong)', padding: '0.25rem 0.75rem',
                        }}>{done}/{total}</span>
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-secondary)',
                        marginBottom: '0.75rem', fontStyle: 'italic',
                      }}>{cat.description}</p>
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 0,
                      }}>
                        {cat.skills.map((skill) => {
                          const k = (() => { const m: Record<string,string> = {a:'ア',b:'ビ',c:'ク',d:'デ',e:'エ',f:'フ',g:'グ',h:'ハ',i:'イ',j:'ジ',k:'カ',l:'ル',m:'マ',n:'ナ',o:'オ',p:'プ',r:'ラ',s:'サ',t:'タ',u:'ウ',v:'ヴ',w:'ワ'}; return m[skill.name.charAt(0).toLowerCase()] || 'ス'; })();
                          const isCompleted = !!progress[skill.id]?.completed;
                          const isSelected = skill.id === guideSkill.id;
                          const hl = isCompleted || isSelected;
                          return (
                            <div key={skill.id} style={{
                              position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
                              justifyContent: 'flex-end', padding: '1.25rem 0.75rem 1rem', minHeight: '120px',
                              background: hl ? 'var(--bg-card-active)' : 'var(--bg-card)',
                              border: `1px solid ${hl ? 'var(--accent)' : 'var(--border)'}`,
                              margin: '-0.5px', textAlign: 'center', userSelect: 'none',
                            }}>
                              <span style={{
                                position: 'absolute', top: '0.6rem', left: '50%', transform: 'translateX(-50%)',
                                fontFamily: 'var(--font-japanese)', fontSize: '2.4rem',
                                color: isCompleted ? 'var(--accent-kanji-active)' : 'var(--accent-kanji)',
                                lineHeight: 1, pointerEvents: 'none',
                              }}>{k}</span>
                              {isCompleted && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--accent)' }} />}
                              {isCompleted && <span style={{
                                position: 'absolute', top: '0.5rem', left: '0.5rem', fontSize: '0.6rem',
                                color: '#fff', background: 'var(--accent)', width: '16px', height: '16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-ui)', fontWeight: 600,
                              }}>✓</span>}
                              <p style={{
                                position: 'relative', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                                color: isCompleted ? 'var(--accent)' : 'var(--text-primary)',
                                lineHeight: 1.3, marginBottom: '0.25rem',
                              }}>{skill.name}</p>
                              <p style={{
                                position: 'relative', fontFamily: 'var(--font-ui)', fontSize: '0.65rem',
                                color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase',
                              }}>{skill.difficulty}</p>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* Annotation — Step 1 */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
                textAlign: 'center',
                maxWidth: '380px',
              }}>
                <div style={{
                  background: 'var(--bg-base)',
                  border: '2px solid var(--accent)',
                  padding: '1.25rem 1.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 600,
                      color: '#fff', background: 'var(--accent)',
                      width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>1</span>
                    <p style={{
                      fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 500,
                      letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)',
                    }}>Pick a skill</p>
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-primary)',
                    lineHeight: 1.6,
                  }}>
                    Each card is a real project. Click one to see what you&apos;ll build and get the instruction for your AI.
                  </p>
                </div>
              </div>

              {/* Dim overlay */}
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(244, 239, 230, 0.7)',
                pointerEvents: 'none', zIndex: 4,
              }} />
            </div>

            {/* RIGHT PANEL — skill detail replica */}
            <div style={{
              width: '420px',
              maxWidth: '420px',
              flexShrink: 0,
              background: 'var(--bg-base)',
              borderLeft: '1px solid var(--border)',
              padding: '1.5rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              position: 'relative',
            }}>
              {/* Real-looking skill detail content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Nav buttons mock */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-strong)', fontSize: '1rem', color: 'var(--text-primary)' }}>‹</div>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-strong)', fontSize: '1rem', color: 'var(--text-primary)' }}>›</div>
                  </div>
                  <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-strong)', fontSize: '1rem', color: 'var(--text-secondary)' }}>✕</div>
                </div>

                {/* Category */}
                <span style={{
                  fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 500,
                  letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-secondary)',
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem',
                }}>
                  <CategoryIcon categoryId={guideCategory.id} /> {guideCategory.name}
                </span>

                {/* Skill name */}
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400,
                  marginBottom: '1rem', lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: '0.6rem',
                }}>
                  <span style={{ fontFamily: 'var(--font-japanese)', fontSize: '1.4rem', color: 'var(--accent-kanji-active)', flexShrink: 0 }}>{guideKatakana}</span>
                  {guideSkill.name}
                </h2>

                {/* Difficulty + time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 500,
                    letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B8E6B',
                    border: '1px solid rgba(107, 142, 107, 0.3)', padding: '0.2rem 0.6rem',
                  }}>Beginner</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                    {guideSkill.timeEstimate}
                  </span>
                </div>

                <div style={{ width: '2rem', height: '2px', background: 'var(--accent)', marginBottom: '1.25rem' }} />

                {/* What you'll build */}
                <p style={{
                  fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 500,
                  letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-tertiary)',
                  marginBottom: '0.5rem',
                }}>What you&apos;ll build</p>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--text-primary)',
                  marginBottom: '0.75rem', lineHeight: 1.4,
                }}>{guideSkill.projectTitle}</p>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.75,
                  color: 'var(--text-secondary)', marginBottom: '1.5rem',
                }}>{guideSkill.projectDescription}</p>

                {/* Tools */}
                <p style={{
                  fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 500,
                  letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-tertiary)',
                  marginBottom: '0.5rem',
                }}>Tools</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.5rem' }}>
                  {guideSkill.tools.map((tool) => (
                    <span key={tool} style={{
                      fontFamily: 'var(--font-ui)', fontSize: '0.65rem', padding: '0.2rem 0.6rem',
                      background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                    }}>{tool}</span>
                  ))}
                </div>

                {/* THE INSTRUCTION BLOCK — highlighted */}
                <div style={{
                  border: '2px solid var(--accent)', borderTop: '3px solid var(--accent)',
                  padding: '1.1rem', background: 'var(--bg-card-active)', position: 'relative',
                  marginBottom: '1.5rem',
                }}>
                  {/* Pulsing glow */}
                  <div style={{
                    position: 'absolute', inset: '-5px', border: '2px solid var(--accent)',
                    opacity: 0.3, animation: 'guidePulse 2s ease-in-out infinite', pointerEvents: 'none',
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 600,
                      color: '#fff', background: 'var(--accent)',
                      width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>2</span>
                    <p style={{
                      fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 500,
                      letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)',
                    }}>Give it to your AI</p>
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-primary)',
                    lineHeight: 1.6, marginBottom: '0.85rem',
                  }}>
                    Copy this and paste it into your AI &mdash; Claude, ChatGPT, Cursor. It tells the AI exactly what to build with you.
                  </p>

                  <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '0.85rem 1rem',
                    marginBottom: '0.65rem',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.6,
                      color: 'var(--text-primary)', margin: 0,
                    }}>
                      I want to learn &ldquo;{guideSkill.name}&rdquo; to know how to {guideSkill.projectTitle.charAt(0).toLowerCase() + guideSkill.projectTitle.slice(1).replace(/\byour\b/gi, 'my').replace(/\byou\b/gi, 'I')}. Can we do it in my project?
                    </p>
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 500,
                    letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff',
                    background: 'var(--accent)', border: '1px solid var(--accent)',
                    padding: '0.45rem 0', textAlign: 'center', width: '100%',
                  }}>
                    Copy instruction
                  </div>
                </div>
              </div>

              {/* Step 3 — Mark as Learned, pinned to bottom */}
              <div style={{
                marginTop: 'auto',
                position: 'relative',
                zIndex: 1,
              }}>
                {/* Mock Mark as Learned button */}
                <div style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '1.25rem',
                  marginTop: '1rem',
                }}>
                  <div style={{
                    position: 'relative',
                  }}>
                    {/* Step 3 badge + label above button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 600,
                        color: '#fff', background: 'var(--accent)',
                        width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>3</span>
                      <p style={{
                        fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 500,
                        letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)',
                      }}>Track your progress</p>
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--text-secondary)',
                      lineHeight: 1.55, marginBottom: '0.75rem',
                    }}>
                      Done building? Mark it. Your progress bar and recommendations update automatically.
                    </p>

                    {/* Mock button */}
                    <div style={{
                      width: '100%', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 500,
                      letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.75rem 0',
                      border: '1px solid var(--accent)', background: 'var(--accent)', color: '#fff',
                      textAlign: 'center',
                    }}>
                      Mark as Learned
                    </div>

                    {/* Pulsing glow on the button */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: '-4px', right: '-4px', height: 'calc(0.75rem * 2 + 0.65rem + 8px)',
                      border: '2px solid var(--accent)', opacity: 0.3,
                      animation: 'guidePulse 2s ease-in-out infinite', pointerEvents: 'none',
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

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
