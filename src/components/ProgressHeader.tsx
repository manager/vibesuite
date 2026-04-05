'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { signOut } from 'next-auth/react';
import { getTotalSkillCount } from '@/data/skills';
import { UserProgress } from '@/types';

interface ProgressHeaderProps {
  progress: UserProgress;
  userEmail: string;
}

const NAV_H = 58;

const MILESTONES = [
  { pct: 20, label: 'Observer', kanji: '観' },
  { pct: 50, label: 'Explorer', kanji: '探' },
  { pct: 80, label: 'Master', kanji: '師' },
  { pct: 100, label: 'Singularity', kanji: '∞' },
];

const HIT_RADIUS = 24;

export default function ProgressHeader({ progress, userEmail }: ProgressHeaderProps) {
  const total = getTotalSkillCount();
  const completed = Object.values(progress).filter((p) => p.completed).length;
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const displayPctRef = useRef(0);
  const hoveredMilestoneRef = useRef<number>(-1); // index into MILESTONES, -1 = none
  const hoveredMilestoneAnimRef = useRef<number[]>(MILESTONES.map(() => 0)); // 0..1 smooth per milestone
  const [tooltipData, setTooltipData] = useState<{ text: string; x: number; reached: boolean } | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const milestonePositions = useRef<{ pct: number; x: number; label: string; skillsNeeded: number }[]>([]);

  const draw = useCallback((canvas: HTMLCanvasElement, t: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Smooth lerp for progress
    const target = pct;
    const current = displayPctRef.current;
    displayPctRef.current += (target - current) * 0.04;
    if (Math.abs(displayPctRef.current - target) < 0.05) displayPctRef.current = target;
    const displayPct = displayPctRef.current;

    // Smooth lerp for milestone hover animations
    const hoverAnims = hoveredMilestoneAnimRef.current;
    for (let i = 0; i < MILESTONES.length; i++) {
      const target = hoveredMilestoneRef.current === i ? 1 : 0;
      hoverAnims[i] += (target - hoverAnims[i]) * 0.12;
      if (Math.abs(hoverAnims[i] - target) < 0.01) hoverAnims[i] = target;
    }

    const barY = h / 2 + 1;
    const barH = 2;
    const padL = 16;
    const padR = 40; // extra right padding so "SINGULARITY" fits
    const barW = w - padL - padR;

    // Track line
    ctx.beginPath();
    ctx.moveTo(padL, barY);
    ctx.lineTo(padL + barW, barY);
    ctx.strokeStyle = '#DDD7CE';
    ctx.lineWidth = barH;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Progress fill
    const fillEnd = padL + (displayPct / 100) * barW;
    if (displayPct > 0) {
      // Glow
      ctx.beginPath();
      ctx.moveTo(padL, barY);
      ctx.lineTo(fillEnd, barY);
      ctx.strokeStyle = 'rgba(184, 50, 50, 0.1)';
      ctx.lineWidth = barH + 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Main fill
      ctx.beginPath();
      ctx.moveTo(padL, barY);
      ctx.lineTo(fillEnd, barY);
      ctx.strokeStyle = '#B83232';
      ctx.lineWidth = barH;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Leading dot — pulsating glow
      const pulse = (Math.sin(t * 1.8) + 1) / 2; // 0..1 smooth
      const glowR = 6 + pulse * 4;
      const glowA = 0.08 + pulse * 0.07;
      ctx.beginPath();
      ctx.arc(fillEnd, barY, glowR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(184, 50, 50, ${glowA})`;
      ctx.fill();

      const dotR = 3 + pulse * 1;
      ctx.beginPath();
      ctx.arc(fillEnd, barY, dotR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(184, 50, 50, ${0.6 + pulse * 0.3})`;
      ctx.fill();
    }

    // Milestones
    const positions: typeof milestonePositions.current = [];

    MILESTONES.forEach((m, i) => {
      const mx = padL + (m.pct / 100) * barW;
      const reached = displayPct >= m.pct;
      const skillsNeeded = Math.ceil((m.pct / 100) * total) - completed;
      const hoverAmt = hoverAnims[i]; // 0..1
      const isLast = i === MILESTONES.length - 1;

      positions.push({ pct: m.pct, x: mx, label: m.label, skillsNeeded: Math.max(0, skillsNeeded) });

      // Per-milestone hover glow — always red
      if (hoverAmt > 0.01) {
        const glowR = 18 + hoverAmt * 6;
        const glowA = hoverAmt * (reached ? 0.15 : 0.1);
        const gradient = ctx.createRadialGradient(mx, barY, 0, mx, barY, glowR);
        gradient.addColorStop(0, `rgba(184, 50, 50, ${glowA})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(mx, barY, glowR, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Tick — transitions to red on hover
      const tickH = 7 + hoverAmt * 2;
      const tickAlpha = reached ? 0.45 + hoverAmt * 0.3 : 0.25 + hoverAmt * 0.5;
      ctx.beginPath();
      ctx.moveTo(mx, barY - tickH);
      ctx.lineTo(mx, barY + tickH);
      ctx.strokeStyle = reached || hoverAmt > 0.01
        ? `rgba(184, 50, 50, ${tickAlpha})`
        : '#D5CFC7';
      ctx.lineWidth = 1 + hoverAmt * 0.5;
      ctx.lineCap = 'butt';
      ctx.stroke();

      // Diamond — transitions to red on hover
      const dS = (reached ? 3.5 : 2.5) + hoverAmt * 1.5;
      ctx.save();
      ctx.translate(mx, barY - 11 - hoverAmt * 1);
      ctx.rotate(Math.PI / 4);
      if (reached || hoverAmt > 0.3) {
        const fillAlpha = reached ? 1 : hoverAmt;
        ctx.fillStyle = `rgba(184, 50, 50, ${fillAlpha})`;
        ctx.fillRect(-dS / 2, -dS / 2, dS, dS);
        const pR = dS + 1.5 + Math.sin(t * 1.5 + m.pct * 0.1) * 1;
        ctx.strokeStyle = `rgba(184, 50, 50, ${0.15 + Math.sin(t * 1.5 + m.pct * 0.1) * 0.08 + hoverAmt * 0.15})`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-pR / 2, -pR / 2, pR, pR);
      } else if (hoverAmt > 0.01) {
        // Transitioning toward red
        ctx.strokeStyle = `rgba(184, 50, 50, ${0.3 + hoverAmt * 0.7})`;
        ctx.lineWidth = 0.75 + hoverAmt * 0.5;
        ctx.strokeRect(-dS / 2, -dS / 2, dS, dS);
      } else {
        ctx.strokeStyle = '#D5CFC7';
        ctx.lineWidth = 0.75;
        ctx.strokeRect(-dS / 2, -dS / 2, dS, dS);
      }
      ctx.restore();

      // Label below — transitions to red on hover
      const labelSize = 8 + hoverAmt * 1;
      ctx.font = `${400 + hoverAmt * 100} ${labelSize}px Jost, system-ui, sans-serif`;
      ctx.textAlign = isLast ? 'right' : 'center';
      ctx.fillStyle = reached || hoverAmt > 0.01
        ? `rgba(184, 50, 50, ${reached ? 1 : 0.4 + hoverAmt * 0.6})`
        : 'rgba(181, 175, 168, 0.6)';
      ctx.fillText(m.label.toUpperCase(), isLast ? mx : mx, barY + 18);

      // Kanji above — transitions to red on hover
      const kanjiSize = 10 + hoverAmt * 2;
      ctx.font = `${kanjiSize}px "Noto Serif JP", serif`;
      ctx.textAlign = isLast ? 'right' : 'center';
      ctx.fillStyle = `rgba(184, 50, 50, ${reached
        ? 0.2 + Math.sin(t * 1.2 + m.pct * 0.05) * 0.08 + hoverAmt * 0.15
        : 0.08 + hoverAmt * 0.25})`;
      ctx.fillText(m.kanji, isLast ? mx : mx, barY - 21 - hoverAmt * 1);
    });

    milestonePositions.current = positions;

    // "To The Glory"
    ctx.font = '300 7px Jost, system-ui, sans-serif';
    ctx.textAlign = 'center';
    const ga = 0.07 + Math.sin(t * 0.6) * 0.03;
    ctx.fillStyle = `rgba(28, 28, 26, ${ga})`;
    ctx.fillText('T O   T H E   G L O R Y', padL + barW / 2, barY + 28);

  }, [pct, total, completed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let running = true;
    const loop = (ts: number) => {
      if (!running) return;
      timeRef.current = ts / 1000;
      draw(canvas, timeRef.current);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [draw]);

  const showTooltip = useCallback((text: string, x: number, reached: boolean) => {
    clearTimeout(tooltipTimer.current);
    setTooltipData({ text, x, reached });
    requestAnimationFrame(() => setTooltipVisible(true));
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltipVisible(false);
    hoveredMilestoneRef.current = -1;
    tooltipTimer.current = setTimeout(() => setTooltipData(null), 250);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const barY = rect.height / 2 + 1;

    let found = false;
    for (let i = 0; i < milestonePositions.current.length; i++) {
      const mp = milestonePositions.current[i];
      const dist = Math.sqrt((mx - mp.x) ** 2 + (my - barY) ** 2);
      if (dist < HIT_RADIUS) {
        hoveredMilestoneRef.current = i;
        const n = mp.skillsNeeded;
        const reached = n === 0;
        const text = reached
          ? `${mp.label} — Reached!`
          : `${n} skill${n === 1 ? '' : 's'} to ${mp.label}`;
        showTooltip(text, mp.x, reached);
        found = true;
        break;
      }
    }
    if (!found) {
      hoveredMilestoneRef.current = -1;
      if (tooltipData) hideTooltip();
    }
  }, [tooltipData, showTooltip, hideTooltip]);

  const handleMouseLeave = useCallback(() => {
    hoveredMilestoneRef.current = -1;
    hideTooltip();
  }, [hideTooltip]);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border)',
        height: `${NAV_H}px`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        gap: '1rem',
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.85rem',
          fontWeight: 400,
          letterSpacing: '0.02em',
          color: 'var(--text-primary)',
          flexShrink: 0,
        }}
      >
        <strong style={{ fontWeight: 600 }}>vibe</strong>code
      </div>

      {/* Progress canvas */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: `${NAV_H}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            width: '100%',
            height: `${NAV_H}px`,
            display: 'block',
            cursor: tooltipData ? 'pointer' : 'default',
          }}
        />
        {/* Tooltip */}
        {tooltipData && (
          <div
            style={{
              position: 'absolute',
              left: tooltipData.x,
              bottom: '-4px',
              transform: `translateX(-50%) translateY(${tooltipVisible ? '0' : '-6px'})`,
              opacity: tooltipVisible ? 1 : 0,
              fontFamily: 'var(--font-ui)',
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: tooltipData.reached ? '#fff' : 'var(--text-primary)',
              background: tooltipData.reached ? 'var(--accent)' : 'var(--bg-card)',
              border: tooltipData.reached ? '1px solid var(--accent)' : '1px solid var(--border-strong)',
              padding: '0.3rem 0.7rem',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10,
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
          >
            {tooltipData.text}
          </div>
        )}
      </div>

      {/* Stats + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.65rem',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          {completed}
          <span style={{ color: 'var(--text-tertiary)' }}> / {total}</span>
          <span style={{ color: 'var(--text-tertiary)', marginLeft: '0.25rem' }}>({Math.round(pct)}%)</span>
        </span>

        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.65rem',
            color: 'var(--text-tertiary)',
            whiteSpace: 'nowrap',
          }}
        >
          {userEmail}
        </span>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.65rem',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            background: 'none',
            border: '1px solid var(--border)',
            padding: '0.2rem 0.6rem',
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
