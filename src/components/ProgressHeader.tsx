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
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">
            <span className="text-white/90">{completed}</span>
            <span className="text-white/30"> / {total} skills</span>
            <span className="text-white/50 ml-2">({pct}%)</span>
          </div>

          {/* Mini progress bar */}
          <div className="hidden sm:block w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
              }}
            />
          </div>

          {/* Category dots */}
          <div className="hidden md:flex items-center gap-1">
            {categories.map((cat) => {
              const catTotal = cat.skills.length;
              const catDone = cat.skills.filter((s) => progress[s.id]?.completed).length;
              const ratio = catTotal > 0 ? catDone / catTotal : 0;

              return (
                <div
                  key={cat.id}
                  title={`${cat.name}: ${catDone}/${catTotal}`}
                  className="w-2.5 h-2.5 rounded-full border"
                  style={{
                    borderColor: cat.color + '60',
                    background:
                      ratio === 0
                        ? 'transparent'
                        : ratio === 1
                          ? cat.color
                          : `linear-gradient(to top, ${cat.color} ${ratio * 100}%, transparent ${ratio * 100}%)`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40 hidden sm:inline">{userEmail}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
