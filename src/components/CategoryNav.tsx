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
    <nav className="fixed left-0 top-14 bottom-0 z-30 w-56 bg-black/40 backdrop-blur-sm border-r border-white/5 overflow-y-auto hidden lg:block">
      <div className="p-3 space-y-1">
        {/* Overview button */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
            activeCategoryId === null
              ? 'bg-white/10 text-white'
              : 'text-white/50 hover:text-white/70 hover:bg-white/5'
          }`}
        >
          🌐 Overview
        </button>

        {categories.map((cat) => {
          const total = cat.skills.length;
          const done = cat.skills.filter((s) => progress[s.id]?.completed).length;
          const isActive = activeCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">
                  {cat.icon} {cat.name}
                </span>
                <span
                  className="text-xs ml-2 shrink-0"
                  style={{ color: done === total && total > 0 ? cat.color : undefined }}
                >
                  {done}/{total}
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="mt-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${total > 0 ? (done / total) * 100 : 0}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
