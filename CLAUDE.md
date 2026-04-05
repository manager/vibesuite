# Vibe Suite — AI Skill Guide

Interactive skill map for vibe coders. Track your journey from first prompt to shipped product.

@AGENTS.md

## What This Is

A web app where users log in via magic link, see a skill map organized into 10 categories (~45 skills total), and mark skills as learned. Each skill is a concrete project ("Build X and learn Y"), not abstract theory. Target audience: non-engineers learning to build products with AI.

The app has a strong editorial voice — it's blunt, motivational, and doesn't sugarcoat the stakes of not learning AI skills.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS + keepsimple design language (see Design section)
- **Auth**: NextAuth.js v5 (Auth.js) with Resend magic link
- **Database**: Upstash Redis (@upstash/redis) — shared with kemmio project
- **Deploy**: Vercel (auto-deploys from `master` branch)

## Critical Rules

### Shared Redis — Key Namespacing
The Redis DB is shared with the **kemmio** project. Kemmio uses keys: `leaderboard:all`, `entry:{id}`, `ratelimit:{ip}`.

**ALL Vibesuite keys MUST be prefixed with `vsm:`** — see `src/lib/redis.ts` for the `redisKey()` helper. Auth.js adapter uses `vsm:authjs:` prefix. NEVER write a bare key without the `vsm:` prefix.

### Single Source of Truth
`src/data/skills.ts` is THE data file. Adding a skill = adding an object to this file. Everything (cards, progress, percentages, recommendations) derives from it automatically. Never hardcode skill data elsewhere.

### Dev Mode
In development (`NODE_ENV=development`), auth is bypassed and progress is stored in-memory. Enter `dev@localhost` on the login page to go directly to `/map`. See `src/components/AuthForm.tsx`, `src/app/map/page.tsx`, `src/middleware.ts`, and `src/app/api/progress/route.ts`.

### Design Language: keepsimple
This project uses the **keepsimple** aesthetic. The full spec is in `keepsimple-style-extracted/keepsimple-style/SKILL.md`. Key points:
- Warm parchment backgrounds (`#F4EFE6`), never pure white
- Fonts: Playfair Display (headings in detail panel only), EB Garamond (body text, nav items, card names), Jost (UI labels, badges, counters)
- Muted crimson accent (`#B83232`) — used sparingly on borders, rules, kanji, active states, selected items
- Kanji/katakana watermarks on skill cards (red-tinted, top-right corner)
- Paper grain texture via SVG filter on `body::after`
- No shadows, no gradients on fills, no heavy visual weight
- All warm-toned grays, never cool/blue-gray

### Font Consistency Rules
The app uses a strict 3-tier font system. Do NOT mix these:
- **Section labels** (TOOLS, PREREQUISITES, CATEGORIES, etc.): Jost (`font-ui`), 0.65rem, uppercase, 0.15em tracking, `--text-tertiary`
- **Body/item text** (nav items, card names, descriptions, prerequisites): EB Garamond (`font-body`), 0.85rem, `--text-secondary`
- **Tags/badges** (counters, difficulty, time, tool tags): Jost (`font-ui`), 0.65rem, `--text-tertiary`
- **Headings**: Playfair Display (`font-display`), 1.4rem — ONLY in the right detail panel skill title

### UX Principles
- **Never push content when panels open.** Left sidebar and right detail panel are fixed overlays (z-index 50). Main content is always centered.
- **Smooth everything.** All interactive elements have 0.15s ease transitions (globally set in CSS). Panel open/close animations are 0.2s. Category switching fades content. Progress bar lerps smoothly.
- **Text is not selectable** on skill cards, section headers, and counters (`userSelect: 'none'`).
- **Close on "Mark as Learned"** — the detail panel closes when user marks a skill as learned (not on unmark).
- **Click-to-dismiss** — clicking empty space in the main skill map area closes the right panel. Clicking cards does NOT close it (stopPropagation on card grid).
- **First-person instructions** — the "Paste this instruction to your project" block converts "your" → "my" and "you" → "I" from projectTitle. The template is: `I want to learn "X" to know how to <projectTitle>. Can we do it in my project?`

## Architecture

```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts  — Auth.js handlers
│   ├── api/progress/route.ts            — GET/POST user skill progress
│   ├── map/
│   │   ├── page.tsx                     — Server component (auth + Redis fetch)
│   │   └── map-client.tsx               — Client orchestrator (ALL state + layout)
│   ├── page.tsx                         — Landing page (redirects if authed)
│   ├── layout.tsx                       — Root layout with Providers
│   ├── providers.tsx                    — SessionProvider wrapper
│   └── globals.css                      — Design tokens, grain texture, animations
├── components/
│   ├── AuthForm.tsx                     — Magic link email form (dev bypass for dev@localhost)
│   ├── CategoryIcons.tsx                — Monochrome SVG icons for each category
│   ├── CategoryNav.tsx                  — Left sidebar: categories + "What to Learn Next" banner
│   ├── LandingClient.tsx                — Landing page UI with floating kanji
│   ├── ProgressHeader.tsx               — Top bar: logo, Canvas progress bar with milestones, stats
│   ├── RecommendationModal.tsx          — "What to Learn Next?" center-screen modal
│   ├── SkillCard.tsx                    — Card with katakana watermark, icon, custom tooltip
│   ├── SkillDetailPanel.tsx             — Right slide-in panel with LLM instruction block
│   └── SkillIcons.tsx                   — Monochrome SVG icons for each individual skill
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

### Progress Bar (ProgressHeader.tsx)
Canvas-rendered with 60fps animation loop. Features:
- Smooth lerp when progress changes (4% per frame)
- 4 milestones: Observer (20%), Explorer (50%), Master (80%), Singularity (100%)
- Per-milestone hover: radial red glow, diamond grows, label/kanji turn red, smooth lerp
- Pulsating leading dot at current progress position
- "TO THE GLORY" faint breathing text
- Milestone tooltips appear below the bar with skill count needed

### Recommendation Engine (lib/recommendations.ts)
Local scoring with no AI dependency:
- +30 unlocked (all prereqs done), +20 hub (unlocks 2+ skills), +10 difficulty match, +5 quick win, -50 locked
- Greedy selection with category diversity penalty
- Returns typed `Recommendation[]` with reasons for display

### Search (in map-client.tsx)
Filters skills across name, projectTitle, and projectDescription. Left-aligned search bar between page title and categories.

### "Why do I need this?" Modal
Motivational modal with background images (public/why-bg-1.jpg, why-bg-2.webp, why-bg-3.jpg) — grayscale masked, subtle. The copy is blunt and intentionally uncomfortable.

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
Edit `src/data/skills.ts` → add a `Skill` object to the appropriate category's `skills` array. Add a corresponding icon in `src/components/SkillIcons.tsx`. The card, progress tracking, percentages, and recommendations update automatically.

### Add a new category
Edit `src/data/skills.ts` → add a `SkillCategory` object to the `categories` array. Add a corresponding icon in `src/components/CategoryIcons.tsx`.

### Run locally
```bash
npm run dev     # starts on port 3000
# Enter dev@localhost on login page — auth is skipped in dev mode
```

### Deploy
Push to `master` → Vercel auto-deploys. Or run `npm run build` locally to check first.

## Language
All UI and content is in **English**.
