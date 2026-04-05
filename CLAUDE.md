# Vibe Suite — AI Skill Guide

A companion app for vibe coders learning to build with AI. Not a course — a skill map. Each skill is a real project. The user copies a prompt, pastes it into their AI assistant (Claude, ChatGPT, Cursor), builds the thing, and marks it learned. The app tracks progress and recommends what to tackle next.

Target audience: non-engineers who want to ship products with AI before the market leaves them behind.

@AGENTS.md

## Core Concept

This is a **bridge between the user and their AI tools**. The app doesn't teach — it tells the AI what to teach. Every skill generates a first-person instruction like: *"I want to learn X to know how to Y. Can we do it in my project?"* The user copies it, pastes it into their AI, and builds.

The editorial voice is blunt. No corporate fluff, no inspirational posters. The "Why do I need this?" modal literally tells people they're becoming irrelevant.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS + keepsimple design language
- **3D**: Three.js + @react-three/fiber (landing page particle scene)
- **Auth**: NextAuth.js v5 (Auth.js) with Resend magic link
- **Database**: Upstash Redis (@upstash/redis) — shared with kemmio project
- **Deploy**: Vercel (auto-deploys from `master` branch)
- **URL**: https://vibesuite.vercel.app

## Critical Rules

### Shared Redis — Key Namespacing
The Redis DB is shared with the **kemmio** project. Kemmio uses keys: `leaderboard:all`, `entry:{id}`, `ratelimit:{ip}`.

**ALL Vibesuite keys MUST be prefixed with `vsm:`** — see `src/lib/redis.ts` for the `redisKey()` helper. Auth.js adapter uses `vsm:authjs:` prefix. NEVER write a bare key without the `vsm:` prefix.

### Single Source of Truth
`src/data/skills.ts` is THE data file. Adding a skill = adding an object to this file. Everything (cards, progress, percentages, recommendations) derives from it automatically. Never hardcode skill data elsewhere.

### Katakana as Visual Identity
Skill cards do NOT have SVG icons. Each card shows a **katakana character** derived from the skill name's first letter (see `KATAKANA_MAP` in SkillCard.tsx). The katakana appears centered at the top of each tile, and next to the skill name in the detail panel and recommendation modal. `SkillIcons.tsx` was deleted — do not recreate it.

### Dev Mode
In development (`NODE_ENV=development`), auth is bypassed and progress is stored in-memory. Enter `dev@localhost` on the login page (input is `type="text"` in dev to accept non-TLD emails). The landing page skips the `auth()` call in dev to avoid Redis errors. See `src/components/AuthForm.tsx`, `src/app/map/page.tsx`, `src/app/page.tsx`, `src/middleware.ts`, and `src/app/api/progress/route.ts`.

### Design Language: keepsimple
This project uses the **keepsimple** aesthetic. The full spec is in `keepsimple-style-extracted/keepsimple-style/SKILL.md`. Key points:
- Warm parchment backgrounds (`#F4EFE6`), never pure white
- Fonts: Playfair Display (headings in detail panel only), EB Garamond (body text, nav items, card names), Jost (UI labels, badges, counters)
- Muted crimson accent (`#B83232`) — used sparingly on borders, rules, kanji, active states, selected items
- Katakana watermarks on skill cards (red-tinted, center-top)
- Paper grain texture via SVG filter on `body::after`
- No shadows, no gradients on fills, no heavy visual weight, no border-radius (square aesthetic)
- All warm-toned grays, never cool/blue-gray

### Font Consistency Rules
The app uses a strict 3-tier font system. Do NOT mix these:
- **Section labels** (TOOLS, HOW TO LEARN THIS, CATEGORIES, etc.): Jost (`font-ui`), 0.65rem, uppercase, 0.15em tracking, `--text-tertiary`
- **Body/item text** (nav items, card names, descriptions, prerequisites): EB Garamond (`font-body`), 0.85rem, `--text-secondary`
- **Tags/badges** (counters, difficulty, time, tool tags): Jost (`font-ui`), 0.65rem, `--text-tertiary`
- **Headings**: Playfair Display (`font-display`), 1.4rem — ONLY in the right detail panel skill title

### Z-Index Layering (strict)
| Layer | z-index | Element |
|-------|---------|---------|
| Paper grain | 9999 | `body::after` (pointer-events: none) |
| Guide overlay | 70 | Full-screen 1:1 replica |
| Modals | 60 | Why modal, Recommendation modal |
| Panels | 50 | CategoryNav (left), SkillDetailPanel (right) |
| Expand button | 31 | Sidebar expand ›  when collapsed |
| Content | default | Main skill grid |

### UX Principles
- **Never push content when panels open.** Left sidebar and right detail panel are fixed overlays (z-index 50). Main content is always centered.
- **Smooth everything.** All interactive elements have 0.15s ease transitions (globally set in CSS). Panel open/close: 0.2s. Category switching AND filter switching: content fades out 150ms → swap data → fade in 50ms (uses `transitioning` state). Progress bar lerps smoothly. Never jump.
- **Hover + active states on all buttons.** Hover fills or changes border/text to accent. Mousedown scales to 96-98%. See ENTER, Mark as Learned, Copy Instruction buttons.
- **Modal closing pattern:** `setClosing(true)` → `setTimeout(180ms)` → `onClose()`. This allows the exit animation (animate-modal-out) to play before unmount.
- **Text is not selectable** on skill cards, section headers, and counters (`userSelect: 'none'`).
- **Close on "Mark as Learned"** — the detail panel closes when user marks a skill as learned (not on unmark).
- **Click-to-dismiss** — clicking empty space in the main skill map area closes the right panel. Clicking cards does NOT close it (stopPropagation on card grid).
- **First-person instructions** — the instruction block converts "your" → "my" and "you" → "I" from projectTitle. Template: `I want to learn "X" to know how to <projectTitle>. Can we do it in my project?`

## Architecture

```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts  — Auth.js handlers
│   ├── api/progress/route.ts            — GET/POST user skill progress
│   ├── map/
│   │   ├── page.tsx                     — Server component (auth + Redis fetch)
│   │   └── map-client.tsx               — Client orchestrator (ALL state + layout + guide overlay)
│   ├── page.tsx                         — Landing page (skips auth in dev)
│   ├── layout.tsx                       — Root layout with Providers
│   ├── providers.tsx                    — SessionProvider wrapper
│   └── globals.css                      — Design tokens, grain texture, animations, keyframes
├── components/
│   ├── AuthForm.tsx                     — Magic link form (dev bypass, onEnter callback for loader)
│   ├── CategoryIcons.tsx                — Monochrome SVG icons for each category
│   ├── CategoryNav.tsx                  — Left sidebar: categories + recommendations + "Why do I need this?"
│   ├── LandingClient.tsx                — Landing page: Three.js scene + auth form + pseudo-loader
│   ├── LandingScene.tsx                 — Three.js: floating kanji, particles, ink lines, mouse parallax
│   ├── ProgressHeader.tsx               — Top bar: logo, Canvas progress bar with milestones, stats
│   ├── RecommendationModal.tsx          — "What to Learn Next?" center-screen modal
│   ├── SkillCard.tsx                    — Card with katakana watermark (center-top), custom tooltip
│   └── SkillDetailPanel.tsx             — Right panel: skill details + emphasized "How to learn this" block
│   (SkillIcons.tsx DELETED — katakana replaced all skill icons)
├── data/
│   └── skills.ts                        — ALL 10 categories + 45 skills + helpers
├── lib/
│   ├── auth.ts                          — NextAuth v5 config (Resend + Redis adapter)
│   ├── recommendations.ts              — Local scoring engine for skill recommendations
│   └── redis.ts                         — Upstash client + vsm: key prefix helper
├── types/
│   └── index.ts                         — Skill, SkillCategory, UserProgress, Recommendation, etc.
└── middleware.ts                         — Protects /map route (skipped in dev mode)
```

## Key Features

### Landing Page (LandingClient.tsx + LandingScene.tsx)
- Three.js background: 60 floating particles (warm/faint/accent), 18 kanji sprites drifting upward, 8 thin ink lines, gentle mouse-follow camera
- Content fades in on load (0.8s)
- On submit: 4-second pseudo-loader ("Generating a plan to keep you relevant...", "Scanning the skill gap...", "Calibrating difficulty curve...", "Mapping your blind spots...") with smooth crimson progress bar, then navigates to `/map`

### Guide Overlay (map-client.tsx)
Full-screen 1:1 replica of the actual UI with real data, triggered by "First time? Click here". Three numbered steps:
1. **Pick a skill** (center annotation over real card grid)
2. **Give it to your AI** (inline on the instruction block in right panel, pulsing glow)
3. **Track your progress** (at bottom of right panel next to Mark as Learned button, pulsing glow)

Left panel shows "Navigate" annotation. Top bar: *"Your AI does the teaching. This map tells it what."*

### Progress Bar (ProgressHeader.tsx)
Canvas-rendered with 60fps animation loop. Smooth lerp (4% per frame), 4 milestones (Observer 20%, Explorer 50%, Master 80%, Singularity 100%), per-milestone hover with red glow, pulsating leading dot, "TO THE GLORY" breathing text.

### "How to Learn This" Section (SkillDetailPanel.tsx)
Emphasized instruction block in the right panel with accent border + top bar. Contains:
- Collapsible "First time? Read this" intro guide (3 steps explaining the copy→paste→build flow)
- The instruction text in `--text-primary` (not secondary)
- Full-width Copy Instruction button with hover fill + press scale

### Recommendation Engine (lib/recommendations.ts)
Local scoring with no AI dependency: +30 unlocked, +20 hub, +10 difficulty match, +5 quick win, -50 locked. Greedy selection with category diversity penalty. Returns `Recommendation[]` with reasons.

### Show Filter (map-client.tsx)
Three-button toggle next to search: ALL | LEARNED | NOT LEARNED. Switching uses same fade transition as category switching (150ms out, swap, fade in). Active button fills accent red.

### Search (map-client.tsx)
Filters skills across name, projectTitle, and projectDescription. Left-aligned between page title and categories.

### "Why do I need this?" Modal
Located in the left sidebar bottom. Motivational modal with grayscale background images. Copy is blunt: "Most knowledge workers are becoming irrelevant. Not next year. Right now."

## Env Variables

```
AUTH_SECRET=<openssl rand -base64 32>
AUTH_RESEND_KEY=<Resend API key>
EMAIL_FROM=onboarding@resend.dev
KV_REST_API_URL=<Upstash Redis REST URL — same as kemmio>
KV_REST_API_TOKEN=<Upstash Redis token — same as kemmio>
NEXTAUTH_URL=https://vibesuite.vercel.app
```

## Data Model

### Skills Taxonomy (10 categories)
1. LLMs & AI Assistants
2. Local AI Models
3. Image & Video Generation
4. Frontend & UI
5. Backend & Databases
6. Auth & Security
7. Deploy & Infrastructure
8. Payments & Monetization
9. Integrations & Services
10. AI Tools for Vibe Coding

### Dependency Graph
- 22 entry-point skills (no dependencies)
- 5 high-value hubs: claude-api-chatbot, api-routes-first, replicate-image-gen, react-nextjs-portfolio, stripe-payments
- 23 terminal skills (nothing depends on them)
- Clean DAG — no circular dependencies

### Redis Keys
- `vsm:user:{email}:progress` → `{ [skillId]: { completed: boolean, completedAt: string } }`
- `vsm:user:{email}:profile` → `{ name: string, joinedAt: string }`
- `vsm:authjs:*` → Auth.js session/token storage

## Common Tasks

### Add a new skill
Edit `src/data/skills.ts` → add a `Skill` object to the appropriate category's `skills` array. The katakana is auto-derived from the first letter via `KATAKANA_MAP`. No icon needed — `SkillIcons.tsx` is deleted. Card, progress tracking, percentages, recommendations, and search all update automatically.

### Add a new category
Edit `src/data/skills.ts` → add a `SkillCategory` object to the `categories` array. Add a corresponding icon in `src/components/CategoryIcons.tsx`.

### Run locally
```bash
npm run dev -- -p 3099    # dev server on port 3099
# Enter dev@localhost on login page — auth is skipped in dev mode
```

### Deploy
Push to `master` → Vercel auto-deploys. Or `npx vercel --prod --yes` from project root (`.vercel/project.json` is configured).

## Language
All UI and content is in **English**.
