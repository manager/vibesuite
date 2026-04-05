<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Guidelines for Vibe Suite

## Before Writing Code
1. Read `CLAUDE.md` for project context, architecture, and rules
2. Read `src/data/skills.ts` to understand the data model — it's the single source of truth
3. Check `src/app/globals.css` for the keepsimple design tokens before styling anything
4. Check `src/components/SkillIcons.tsx` and `src/components/CategoryIcons.tsx` before adding new icons

## Tone & Voice
The product has a blunt, no-bullshit editorial voice. The user (project owner) communicates directly and expects the same. Key guidelines:
- Don't sugarcoat, don't add filler text, don't be corporate
- Instruction text in the skill panel must be first-person ("my project", not "your project")
- Motivational copy (like the "Why do I need this?" modal) should be sharp and uncomfortable — not inspirational-poster fluff
- When writing any user-facing text, read it aloud. If it sounds like a chatbot wrote it, rewrite it.

## Style Rules — keepsimple Design Language
If you have access to the `keepsimple-style` skill file, load it before any visual work. The full spec is in `keepsimple-style-extracted/keepsimple-style/SKILL.md`.

### Font System (strict — do not deviate)
There are exactly 3 tiers. Using the wrong font at the wrong size creates visual discord:

| Role | Font | Size | Weight | Example |
|------|------|------|--------|---------|
| Section labels | Jost (`--font-ui`) | 0.65rem | 500, uppercase, 0.15em tracking | TOOLS, PREREQUISITES, CATEGORIES |
| Body/items | EB Garamond (`--font-body`) | 0.85rem | 400 | Nav items, card names, descriptions |
| Tags/badges | Jost (`--font-ui`) | 0.65rem | 400-500 | 0/6, BEGINNER, 2-3 hours |
| Panel heading | Playfair Display (`--font-display`) | 1.4rem | 400 | Skill name in detail panel ONLY |

### Color Rules
- Background: `#F4EFE6` (`--bg-base`), cards `#F7F2EA`, never `#fff`
- Accent: `#B83232` (`--accent`) — borders, rules, active kanji, selected states. Never as large fills
- Text: `#1C1C1A` primary, `#756F69` secondary, `#968F87` tertiary. All warm, never blue-gray
- Kanji on cards: `rgba(184, 50, 50, 0.3)` default, `rgba(184, 50, 50, 0.6)` completed
- Selected/active items in left panel: text turns `--accent` red, background `--bg-card-active`, left border 3px `--accent`

### Interaction Rules
- All `a`, `button`, `[role="button"]` have global 0.15s ease transitions (set in globals.css)
- Panels slide in/out: 0.2s ease (CSS keyframes in globals.css)
- Modals fade+scale: 0.2s ease (`.animate-modal-in`/`.animate-modal-out`)
- Category switching: content fades out 150ms, swaps, fades in
- Progress bar: lerps at 4% per frame, never jumps
- Hover states on milestones: per-milestone red glow, smooth lerp via animation ref
- No shadows. No gradients on fills. No border-radius (square aesthetic).
- Paper grain texture is on `body::after` at z-index 9999 with `pointer-events: none` — never remove

### Layout Rules
- Left sidebar (CategoryNav): 260px, fixed overlay at z-index 50. Slides via translateX. Never pushes content.
- Right detail panel (SkillDetailPanel): max 420px, fixed overlay at z-index 50. Slides in/out.
- Modals: z-index 60, center-screen.
- Main content: always centered, no left padding for sidebar. Sidebar overlays on top.
- Navbar: 58px height. All dependent offsets (sidebar top, main paddingTop, expand button) must match.
- Skill cards: `userSelect: 'none'`. Section headers: `userSelect: 'none'`.

## Redis Safety
The database is **shared with the kemmio project**. Every Redis key MUST use the `redisKey()` helper from `src/lib/redis.ts` which prefixes with `vsm:`. Direct `redis.get("something")` without the prefix is FORBIDDEN.

## Dev vs Production
- **Dev** (`NODE_ENV=development`): Auth bypassed, enter `dev@localhost` on login. Progress in-memory. Middleware skipped.
- **Production**: Full auth via NextAuth + Resend magic link. Progress persists in Redis.

## File Ownership & Patterns

### Adding a new skill
1. Add `Skill` object to `src/data/skills.ts` in the appropriate category
2. Add SVG icon to `src/components/SkillIcons.tsx` (monochrome line art, 24×24 viewBox, strokeWidth 1.5)
3. Everything else (cards, progress, recommendations, search) updates automatically

### Adding a new category
1. Add `SkillCategory` object to `src/data/skills.ts`
2. Add SVG icon to `src/components/CategoryIcons.tsx` (same style as skill icons)

### Component Patterns
- All components are `'use client'` with inline styles using CSS variables
- No component library — everything is custom React + CSS
- Buttons use the `navBtnStyle` pattern: 36×36px, `--bg-card`, `--border-strong`, hover turns `--accent`
- Modals use the `closing` state pattern: set closing → setTimeout → call onClose (allows exit animation)
- Tooltips: custom div elements with opacity/transform transitions, never native `title` attributes

### Recommendation Engine (`src/lib/recommendations.ts`)
Pure function, no React. Scoring: +30 unlocked, +20 hub, +10 difficulty match, +5 quick win, -50 locked. Greedy selection with -15 same-category diversity penalty. Returns `Recommendation[]` with typed reasons.

## Testing Changes
1. `npm run build` — catches TypeScript errors and build issues
2. `npm run dev` → open `/map` — check visual correctness
3. Click cards → verify detail panel opens, selected state shows on card
4. Mark skills as learned → verify panel closes, progress bar animates smoothly
5. Open "What to Learn Next?" → verify 3 suggestions with reasons
6. Search → verify filtering across skill names, project titles, descriptions
7. Collapse/expand sidebar → verify overlay behavior, no content shift
8. Hover milestones → verify per-milestone red glow and tooltip below bar
