'use client';

import AuthForm from '@/components/AuthForm';

const KANJI_CHARS = ['技', '道', '創', '学', '知', '力', '心', '夢'];

export default function LandingClient() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating kanji watermarks */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {KANJI_CHARS.map((k, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              fontFamily: 'var(--font-japanese)',
              fontSize: `${3 + Math.random() * 4}rem`,
              color: 'var(--accent-kanji)',
              left: `${10 + (i % 4) * 22}%`,
              top: `${8 + Math.floor(i / 4) * 45}%`,
              transform: `rotate(${-10 + Math.random() * 20}deg)`,
              userSelect: 'none',
            }}
          >
            {k}
          </span>
        ))}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Diamond accent */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>·</span>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
            }}
          >
            Interactive Skill Tree
          </span>
          <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>·</span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 400,
            lineHeight: 1.15,
            marginBottom: '1rem',
            color: 'var(--text-primary)',
          }}
        >
          Vibe Code<br />
          <span style={{ fontWeight: 700 }}>Skill Map</span>
        </h1>

        {/* Red rule */}
        <div
          style={{
            width: '2.5rem',
            height: '2px',
            background: 'var(--accent)',
            margin: '0 auto 1.5rem',
          }}
        />

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            maxWidth: '420px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.75,
          }}
        >
          Track your journey in vibe coding. A curated path from first
          prompt to shipped product — for builders who create with AI.
        </p>

        {/* Auth form */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AuthForm />
        </div>

        <p
          style={{
            marginTop: '1.5rem',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'var(--text-tertiary)',
          }}
        >
          Sign in with a magic link — no password needed
        </p>
      </div>
    </main>
  );
}
