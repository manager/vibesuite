<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Guidelines for Vibe Suite

## The Product in One Sentence
A companion app that tells your AI assistant what to teach you — you copy an instruction, paste it into Claude/ChatGPT/Cursor, build a real project, and mark it learned.

## Before Writing Code
1. Read `CLAUDE.md` for project context, architecture, and rules
2. Read `src/data/skills.ts` — single source of truth for all skill data
3. Check `src/app/globals.css` for design tokens and keyframes before styling
4. Check `src/components/CategoryIcons.tsx` before adding new category icons
5. **SkillIcons.tsx is deleted.** Cards use katakana characters, not SVG icons. Do not recreate an icon system for individual skills.

## Tone & Voice
The product has a blunt, no-bullshit editorial voice. The user (project owner) communicates directly and expects the same. Key guidelines:
- Don't sugarcoat, don't add filler text, don't be corporate
- Instruction text in the skill panel must be first-person ("my project", not "your project")
- Motivational copy (like the "Why do I need this?" modal) should be sharp and uncomfortable — not inspirational-poster fluff
- When writing any user-facing text, read it aloud. If it sounds like a chatbot wrote it, rewrite it

## Style Rules — keepsimple Design Language
If you have access to the `keepsimple-style` skill file, load it before any visual work. The full spec is in `keepsimple-style-extracted/keepsimple-style/SKILL.md`.

### Font System (strict — do not deviate)
There are exactly 3 tiers. Using the wrong font at the wrong size creates visual discord:

| Role | Font | Size | Weight | Example |
|------|------|------|--------|---------|
| Section labels | Jost (`--font-ui`) | 0.65rem | 500, uppercase, 0.15em tracking | TOOLS, HOW TO LEARN THIS, CATEGORIES |
| Body/items | EB Garamond (`--font-body`) | 0.85rem | 400 | Nav items, card names, descriptions |
| Tags/badges | Jost (`--font-ui`) | 0.65rem | 400-500 | 0/6, BEGINNER, 2-3 hours |
| Panel heading | Playfair Display (`--font-display`) | 1.4rem | 400 | Skill name in detail panel ONLY |

### Color Rules
- Background: `#F4EFE6` (`--bg-base`), cards `#F7F2EA`, never `#fff`
- Accent: `#B83232` (`--accent`) — borders, rules, active kanji, selected states. Never as large fills (except buttons)
- Text: `#1C1C1A` primary, `#756F69` secondary, `#968F87` tertiary. All warm, never blue-gray
- Kanji on cards: `rgba(184, 50, 50, 0.3)` default, `rgba(184, 50, 50, 0.6)` completed
- Selected/active items in left panel: text turns `--accent` red, background `--bg-card-active`, left border 3px `--accent`

### Interaction Rules
- All `a`, `button`, `[role="button"]` have global 0.15s ease transitions (set in globals.css)
- **Every button needs hover + active (mousedown) states.** Hover: fill accent or change border/text to accent. Active: `scale(0.96)` to `scale(0.98)`. No exceptions.
- Panels slide in/out: 0.2s ease (CSS keyframes in globals.css)
- Modals fade+scale: 0.2s ease (`.animate-modal-in`/`.animate-modal-out`)
- Category switching AND filter switching: content fades out 150ms → swaps data → fades in 50ms (uses `transitioning` state)
- Progress bar: lerps at 4% per frame, never jumps
- No shadows. No gradients on fills. No border-radius (square aesthetic).
- Paper grain texture is on `body::after` at z-index 9999 with `pointer-events: none` — never remove

### Layout Rules
- Left sidebar (CategoryNav): 260px, fixed overlay at z-index 50. Slides via translateX. Never pushes content.
- Right detail panel (SkillDetailPanel): max 420px, fixed overlay at z-index 50. Slides in/out.
- Modals: z-index 60, center-screen.
- Guide overlay: z-index 70, full-screen.
- Main content: always centered, no left padding for sidebar. Sidebar overlays on top.
- Navbar: 58px height. All dependent offsets (sidebar top, main paddingTop, expand button) must match.
- Skill cards: `userSelect: 'none'`. Section headers: `userSelect: 'none'`.

### Katakana System
Every skill card and detail panel uses a katakana character derived from the skill name's first letter via `KATAKANA_MAP`. The map is duplicated in `SkillCard.tsx`, `SkillDetailPanel.tsx`, and `RecommendationModal.tsx`. If you need the map elsewhere, copy it — don't create a shared util (keeps components self-contained).

## Redis Safety
The database is **shared with the kemmio project**. Every Redis key MUST use the `redisKey()` helper from `src/lib/redis.ts` which prefixes with `vsm:`. Direct `redis.get("something")` without the prefix is FORBIDDEN.

## Dev vs Production
- **Dev** (`NODE_ENV=development`): Auth bypassed, enter `dev@localhost` on login (input is `type="text"` in dev). Landing page skips `auth()` call. Progress in-memory. Middleware skipped. Port 3099.
- **Production**: Full auth via NextAuth + Resend magic link. Progress persists in Redis.

## File Ownership & Patterns

### Adding a new skill
1. Add `Skill` object to `src/data/skills.ts` in the appropriate category
2. Katakana is auto-derived from first letter — no icon needed
3. Everything else (cards, progress, recommendations, search, filters) updates automatically

### Adding a new category
1. Add `SkillCategory` object to `src/data/skills.ts`
2. Add SVG icon to `src/components/CategoryIcons.tsx` (monochrome line art, 24×24 viewBox, strokeWidth 1.5)

### Component Patterns
- All components are `'use client'` with inline styles using CSS variables
- No component library — everything is custom React + CSS
- Buttons use the `navBtnStyle` pattern: 36×36px, `--bg-card`, `--border-strong`, hover turns `--accent`
- Modals use the `closing` state pattern: set closing → setTimeout → call onClose (allows exit animation)
- Tooltips: custom div elements with opacity/transform transitions, never native `title` attributes
- Landing page uses `next/dynamic` with `ssr: false` for Three.js components

### Three.js Landing (LandingScene.tsx)
- Uses @react-three/fiber Canvas with transparent background
- Components: Particles (60 warm-toned dots), KanjiField (18 floating kanji sprites), InkLines (8 drifting horizontal rules), CameraRig (mouse parallax)
- All textures generated via CanvasTexture — no external image files
- Wrapped in `dynamic(() => import('./LandingScene'), { ssr: false })`

### Guide Overlay (map-client.tsx)
1:1 replica of the actual UI using real data from `categories` and `skills`. Three numbered steps with accent-red square badges. Uses `showGuideModal` / `guideClosing` state. The instruction block and Mark as Learned button have pulsing glow (`guidePulse` keyframe in globals.css).

### Recommendation Engine (`src/lib/recommendations.ts`)
Pure function, no React. Scoring: +30 unlocked, +20 hub, +10 difficulty match, +5 quick win, -50 locked. Greedy selection with -15 same-category diversity penalty. Returns `Recommendation[]` with typed reasons.

## Testing Changes
1. `npm run build` — catches TypeScript errors and build issues
2. `npm run dev -- -p 3099` → open `/` — verify Three.js landing, pseudo-loader on dev@localhost login
3. Open `/map` — check visual correctness of skill cards with katakana
4. Click cards → verify detail panel opens with katakana, "How to learn this" block emphasized
5. Mark skills as learned → verify panel closes, progress bar animates smoothly
6. Switch filters (All/Learned/Not Learned) → verify smooth fade transitions, no jarring pop
7. "First time? Click here" → verify 1:1 guide overlay with 3 numbered steps
8. Open "What to Learn Next?" from sidebar → verify 3 suggestions with reasons
9. Search → verify filtering across skill names, project titles, descriptions
10. Collapse/expand sidebar → verify overlay behavior, no content shift
11. "Why do I need this?" in sidebar bottom → verify modal with background images
