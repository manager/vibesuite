'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthForm from '@/components/AuthForm';
import dynamic from 'next/dynamic';

const LandingScene = dynamic(() => import('./LandingScene'), { ssr: false });

const LOADER_MESSAGES = [
  'Generating a plan to keep you relevant...',
  'Scanning the skill gap...',
  'Calibrating difficulty curve...',
  'Mapping your blind spots...',
];

function LoaderScreen() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Cycle messages
    const msgTimer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADER_MESSAGES.length);
    }, 1200);

    // Smooth progress bar
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        // Ease out — slows down as it approaches 100
        const remaining = 100 - prev;
        return prev + remaining * 0.04;
      });
    }, 30);

    // Navigate after 4s
    const navTimer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(() => {
        window.location.href = '/map';
      }, 400);
    }, 4000);

    return () => {
      clearInterval(msgTimer);
      clearInterval(progressTimer);
      clearTimeout(navTimer);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Kanji watermark behind loader */}
      <span
        style={{
          position: 'absolute',
          fontFamily: 'var(--font-japanese)',
          fontSize: '12rem',
          color: 'var(--accent-kanji)',
          userSelect: 'none',
          opacity: 0.5,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        道
      </span>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%', maxWidth: '360px', padding: '0 2rem' }}>
        {/* Message */}
        <p
          key={msgIndex}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2rem',
            animation: 'loaderFadeIn 0.3s ease',
          }}
        >
          {LOADER_MESSAGES[msgIndex]}
        </p>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: '2px',
            background: 'var(--border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progress}%`,
              background: 'var(--accent)',
              transition: 'width 0.05s linear',
            }}
          />
        </div>

        {/* Percentage */}
        <p
          style={{
            marginTop: '0.75rem',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.6rem',
            fontWeight: 500,
            letterSpacing: '0.2em',
            color: 'var(--text-tertiary)',
          }}
        >
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}

export default function LandingClient() {
  const [visible, setVisible] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = useCallback(() => {
    setShowLoader(true);
  }, []);

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
      {/* Loader overlay */}
      {showLoader && <LoaderScreen />}

      {/* Three.js background */}
      <LandingScene />

      {/* Content — floats above the 3D scene */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
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
          <AuthForm onEnter={handleEnter} />
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
