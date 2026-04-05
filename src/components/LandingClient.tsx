'use client';

import dynamic from 'next/dynamic';
import AuthForm from '@/components/AuthForm';

const LandingScene = dynamic(() => import('@/components/LandingScene'), { ssr: false });

export default function LandingClient() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <LandingScene />
      </div>

      {/* Overlay content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl sm:text-6xl font-bold mb-3 tracking-tight">
            <span
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899, #3B82F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Vibe Code
            </span>{' '}
            <span className="text-white">Skill Map</span>
          </h1>
          <p className="text-white/50 text-lg max-w-md mx-auto">
            Track your journey in vibe coding. Interactive 3D skill tree
            for builders who ship with AI.
          </p>
        </div>

        <AuthForm />

        <p className="mt-6 text-xs text-white/20">
          Sign in with a magic link — no password needed
        </p>
      </div>
    </main>
  );
}
