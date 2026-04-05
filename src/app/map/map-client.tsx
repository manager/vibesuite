'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { UserProgress } from '@/types';
import { getSkillById, getCategoryBySkillId } from '@/data/skills';
import { useIsMobile } from '@/hooks/useIsMobile';
import ProgressHeader from '@/components/ProgressHeader';
import CategoryNav from '@/components/CategoryNav';
import SkillDetailPanel from '@/components/SkillDetailPanel';

const SkillMap3D = dynamic(() => import('@/components/SkillMap3D'), { ssr: false });
const SkillMap2D = dynamic(() => import('@/components/SkillMap2D'), { ssr: false });

interface MapClientProps {
  initialProgress: UserProgress;
  userEmail: string;
}

export default function MapClient({ initialProgress, userEmail }: MapClientProps) {
  const isMobile = useIsMobile();
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [focusCategoryId, setFocusCategoryId] = useState<string | null>(null);

  const selectedSkill = selectedSkillId ? getSkillById(selectedSkillId) : null;
  const selectedCategory = selectedSkillId ? getCategoryBySkillId(selectedSkillId) : null;

  const handleSelectSkill = useCallback((skillId: string) => {
    setSelectedSkillId(skillId);
  }, []);

  const handleToggle = useCallback(
    async (skillId: string, completed: boolean) => {
      // Optimistic update
      setProgress((prev) => {
        const next = { ...prev };
        if (completed) {
          next[skillId] = { completed: true, completedAt: new Date().toISOString() };
        } else {
          delete next[skillId];
        }
        return next;
      });

      // Persist
      try {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillId, completed }),
        });

        if (!res.ok) {
          setProgress(initialProgress);
        }
      } catch {
        setProgress(initialProgress);
      }
    },
    [initialProgress],
  );

  const handleSelectCategory = useCallback((categoryId: string | null) => {
    setFocusCategoryId(categoryId);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <ProgressHeader progress={progress} userEmail={userEmail} />

      {!isMobile && (
        <CategoryNav
          progress={progress}
          activeCategoryId={focusCategoryId}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Map */}
      <div className={`absolute inset-0 top-14 ${isMobile ? '' : 'lg:left-56'}`}>
        {isMobile ? (
          <SkillMap2D progress={progress} onSelectSkill={handleSelectSkill} />
        ) : (
          <SkillMap3D
            progress={progress}
            onSelectSkill={handleSelectSkill}
            focusCategoryId={focusCategoryId}
          />
        )}
      </div>

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
