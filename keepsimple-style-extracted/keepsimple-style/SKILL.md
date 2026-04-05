---
name: keepsimple-style
description: Apply the "keepsimple" design language — a Japanese wabi-sabi meets Western editorial aesthetic — to any frontend component, page, or UI. Use this skill whenever the user references the keepsimple brand, asks for a Japanese-minimalist web design with paper textures and kanji watermarks, wants the cream/terracotta/editorial aesthetic, or uploads screenshots of the keepsimple site. Also trigger when the user says "that design style from the screenshots", "the contributors page style", or "Japanese editorial minimalism". This skill produces HTML/CSS/JS or React code with the precise visual system including grain textures, faded kanji, crimson accents, and the wabi-sabi card grid.
---

# keepsimple Design Style

A precise replication guide for the **keepsimple** visual language — Japanese wabi-sabi minimalism fused with Western editorial typography.

## Core Aesthetic Identity

**Mood**: Calm, scholarly, timeless. Like a well-worn Japanese notebook used by a Western academic.  
**Key tension**: Eastern restraint + Western editorial structure.  
**Signature**: Faded kanji watermarks on cards, paper-grain texture, sparse crimson accents.

---

## Color System

```css
:root {
  /* Backgrounds */
  --bg-base:        #F4EFE6;   /* warm parchment — page background */
  --bg-card:        #F7F2EA;   /* slightly warmer — card surface */
  --bg-card-active: #FDF5E8;   /* active/highlighted card */
  --bg-hero:        #EDE7DA;   /* featured banner background */

  /* Text */
  --text-primary:   #1C1C1A;   /* near-black, slightly warm */
  --text-secondary: #8A8480;   /* muted warm gray — roles, captions */
  --text-tertiary:  #B5AFA8;   /* very light — inactive, placeholders */

  /* Accent */
  --accent:         #B83232;   /* muted crimson — the ONE color, use sparingly */
  --accent-light:   #D4504A;   /* slightly brighter variant */
  --accent-kanji:   rgba(184, 50, 50, 0.18);  /* faded kanji on inactive cards */
  --accent-kanji-active: rgba(184, 50, 50, 0.55); /* kanji on active/highlighted cards */

  /* Borders & Dividers */
  --border:         #DDD7CE;   /* barely-there card borders */
  --border-strong:  #C8C0B5;   /* section dividers, rule lines */
  --divider-accent: #B83232;   /* red rule lines under section headers */
}
```

**Rules:**
- Red (`--accent`) appears on: active card kanji, active card borders, section rule lines, bullet diamonds, link underlines, quote marks, button outlines
- Never use red for large fills — accent only, always sparse
- All grays must have warm undertones (never cool/blue-gray)

---

## Typography

```css
/* Import */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500;600&display=swap');

:root {
  --font-display:  'Playfair Display', Georgia, serif;   /* page titles, names */
  --font-body:     'EB Garamond', Georgia, serif;        /* body text, descriptions */
  --font-ui:       'Jost', system-ui, sans-serif;        /* nav, labels, UI chrome */
  --font-japanese: 'Noto Serif JP', serif;               /* kanji watermarks */
}
```

**Type Scale:**
```css
/* Page title (e.g. "CONTRIBUTORS") */
.page-title {
  font-family: var(--font-ui);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 300;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--text-primary);
}

/* Section label (e.g. "HEROES") */
.section-label {
  font-family: var(--font-ui);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-primary);
}

/* Contributor name */
.card-name {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* Role / subtitle */
.card-role {
  font-family: var(--font-ui);
  font-size: 0.7rem;
  font-weight: 300;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.4;
}

/* Body text */
.body-text {
  font-family: var(--font-body);
  font-size: 0.9rem;
  line-height: 1.75;
  color: var(--text-secondary);
}
```

---

## Texture & Background

The paper grain texture is essential — it distinguishes the aesthetic from sterile flat design.

```css
/* Grain texture via SVG filter — no image needed */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.35;
}

body {
  background-color: var(--bg-base);
  background-image: 
    radial-gradient(ellipse at 20% 50%, rgba(200, 180, 140, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(180, 160, 120, 0.06) 0%, transparent 50%);
}
```

**Alternative: CSS-only grain (lighter)**
```css
body {
  background-color: var(--bg-base);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
}
```

---

## Card Component

The card is the core atom. It has a faded kanji watermark, name, and role.

```html
<div class="contributor-card" data-active="false">
  <span class="kanji-bg" aria-hidden="true">ア</span>
  <p class="card-name">Artem</p>
  <p class="card-role">Engineering lead<br>[2020 - 2022]</p>
</div>
```

```css
.contributor-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 1.25rem 1rem 1rem;
  min-height: 110px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.contributor-card:hover,
.contributor-card[data-active="true"] {
  border-color: var(--accent);
  background: var(--bg-card-active);
}

/* The kanji watermark */
.kanji-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-japanese), serif;
  font-size: 3.5rem;
  color: var(--accent-kanji);
  line-height: 1;
  user-select: none;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.contributor-card:hover .kanji-bg,
.contributor-card[data-active="true"] .kanji-bg {
  color: var(--accent-kanji-active);
}

/* Active state: name in red */
.contributor-card[data-active="true"] .card-name {
  color: var(--accent);
}
```

**Card Grid:**
```css
.cards-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0; /* no gap — cards share borders */
}

/* Cards share borders (collapse border trick) */
.contributor-card {
  margin: -0.5px; /* or use outline instead of border */
}

/* Responsive */
@media (max-width: 768px) {
  .cards-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 480px) {
  .cards-grid { grid-template-columns: repeat(2, 1fr); }
}
```

---

## Section Header Pattern

```html
<div class="section-header">
  <h2 class="section-label">Heroes</h2>
  <div class="section-rule"></div>
  <button class="pill-button">Currently Active</button>
</div>
```

```css
.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-rule {
  flex: 1;
  height: 1px;
  background: var(--border-strong);
}

.pill-button {
  font-family: var(--font-ui);
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-primary);
  background: transparent;
  border: 1px solid var(--border-strong);
  padding: 0.35rem 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.pill-button:hover {
  border-color: var(--accent);
  color: var(--accent);
}
```

---

## Page Title with Diamond Bullets

```html
<div class="page-heading">
  <span class="diamond">·</span>
  <h1 class="page-title">Contributors</h1>
  <span class="diamond">·</span>
</div>
<p class="page-subtitle">This project is the result of...</p>
```

```css
.page-heading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.diamond {
  color: var(--accent);
  font-size: 1.5rem;
  line-height: 1;
}

.page-subtitle {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  max-width: 480px;
  margin: 0 auto;
  line-height: 1.75;
}
```

---

## Featured Hero / Slideshow Card

```html
<div class="hero-card">
  <button class="nav-arrow left">‹</button>
  <div class="hero-content">
    <h2 class="hero-name">Artem Alchangyan</h2>
    <div class="hero-meta">
      <div class="meta-row">
        <span class="meta-icon">✕</span>
        <span class="meta-label">Specialization</span>
      </div>
      <!-- more rows -->
    </div>
  </div>
  <div class="hero-image"><!-- illustration --></div>
  <button class="nav-arrow right">›</button>
</div>
```

```css
.hero-card {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-hero);
  border: 1px solid var(--border);
  min-height: 200px;
  padding: 2rem 3rem;
  overflow: hidden;
}

.hero-name {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 400;
  margin-bottom: 1.5rem;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
}
.nav-arrow.left { left: 0.75rem; }
.nav-arrow.right { right: 0.75rem; }
```

---

## Navigation Bar

```css
.navbar {
  display: flex;
  align-items: center;
  padding: 0 2rem;
  height: 48px;
  background: var(--bg-base);
  border-bottom: 1px solid var(--border);
}

.nav-logo {
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--text-primary);
  margin-right: auto;
}

.nav-logo strong { font-weight: 600; }

.nav-links {
  display: flex;
  gap: 1.75rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  font-family: var(--font-ui);
  font-size: 0.78rem;
  font-weight: 400;
  color: var(--text-secondary);
  text-decoration: none;
  letter-spacing: 0.01em;
  transition: color 0.15s;
}

.nav-link:hover,
.nav-link.active { color: var(--text-primary); }
.nav-link.active { text-decoration: underline; text-underline-offset: 3px; }
```

---

## Quote / Testimonial Block

```html
<blockquote class="testimonial">
  <p class="testimonial-text">This is the first-of-its-kind, biggest library of nudging strategies based on cognitive biases.</p>
  <div class="testimonial-author">
    <img class="author-avatar" src="..." alt="Dan Ariely">
    <div>
      <p class="author-name">Dan Ariely</p>
      <p class="author-title">Professor of psychology and behavioral economics at Duke University</p>
    </div>
  </div>
</blockquote>
```

```css
.testimonial {
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 1.5rem;
  position: relative;
}

.testimonial::before {
  content: '"';
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--accent);
  line-height: 1;
  position: absolute;
  top: 0.75rem;
  left: 1rem;
}

.testimonial-text {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.65;
  margin-top: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-family: var(--font-ui);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-primary);
}

.author-title {
  font-family: var(--font-ui);
  font-size: 0.65rem;
  color: var(--text-secondary);
  line-height: 1.4;
}
```

---

## Red Accent Divider

Used before section headings like "UX Core", "Company Management":

```css
.accent-rule {
  width: 2.5rem;
  height: 2px;
  background: var(--accent);
  margin-bottom: 0.75rem;
}
```

---

## Layout Wrapper

```css
.page-wrapper {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section {
  padding: 4rem 0;
}

.section + .section {
  padding-top: 0;
}
```

---

## Kanji Reference

Common kanji used as card watermarks (romanized names → katakana):
- A → ア　　I → イ　　U → ウ
- Ka → カ　　Ki → キ　　Ku → ク
- Sa → サ　　Si/Shi → シ　　Su → ス
- Ta → タ　　Chi → チ　　To → ト
- Na → ナ　　Ni → ニ　　Nu → ヌ
- Ha → ハ　　Hi → ヒ　　He → ヘ
- Ma → マ　　Mi → ミ　　Mo → モ
- Ya → ヤ　　Yu → ユ　　Yo → ヨ
- Ra → ラ　　Ri → リ　　Ru → ル　　Re → レ
- Wa → ワ　　Wo → ヲ　　N → ン

For compound names, use the first 1-2 characters of the name in katakana.

For Japanese kanji font, load from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400&display=swap" rel="stylesheet">
```

---

## Do / Don't

| ✅ Do | ❌ Don't |
|-------|----------|
| Warm off-white backgrounds | Pure white (#fff) backgrounds |
| Sparse red accents (borders, rules, kanji) | Red fills, red backgrounds |
| Wide letter-spacing on uppercase labels | Tight tracking on headings |
| Serif for names/display text | Sans-serif for everything |
| Faded kanji watermarks on cards | Decorative elements without the paper feel |
| Barely-there borders | Heavy drop shadows |
| Grain texture on background | Completely flat, textureless pages |
| Minimalist nav with small text | Heavy navbar with dark background |

---

## Quick Start Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=EB+Garamond:wght@400;500&family=Jost:wght@300;400;500;600&family=Noto+Serif+JP:wght@400&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg-base: #F4EFE6;
      --bg-card: #F7F2EA;
      --bg-card-active: #FDF5E8;
      --text-primary: #1C1C1A;
      --text-secondary: #8A8480;
      --text-tertiary: #B5AFA8;
      --accent: #B83232;
      --accent-kanji: rgba(184,50,50,0.18);
      --accent-kanji-active: rgba(184,50,50,0.55);
      --border: #DDD7CE;
      --border-strong: #C8C0B5;
      --font-display: 'Playfair Display', Georgia, serif;
      --font-body: 'EB Garamond', Georgia, serif;
      --font-ui: 'Jost', system-ui, sans-serif;
      --font-japanese: 'Noto Serif JP', serif;
    }

    body {
      background-color: var(--bg-base);
      font-family: var(--font-body);
      color: var(--text-primary);
      min-height: 100vh;
    }

    /* Add grain texture */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 9999;
    }

    .page-wrapper { max-width: 960px; margin: 0 auto; padding: 0 2rem; }
  </style>
</head>
<body>
  <!-- Your keepsimple-styled content here -->
</body>
</html>
```
