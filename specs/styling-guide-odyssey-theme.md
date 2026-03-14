# Odyssey Styling Guide (Phase 1)

**Version:** 1.0  
**Date:** March 14, 2026  
**Theme Direction:** Dark fantasy + dungeon atmosphere + technical terminal precision

## 1. Theme Intent

Odyssey UI should feel like:

- A calm command center for life progression
- A subtle medieval/dungeon world (stone, iron, parchment hints)
- A technical console for self-tracking (terminal clarity, precise feedback)

Design target:

- `70%` modern product UI clarity
- `20%` atmospheric fantasy tone
- `10%` terminal/ops aesthetic accents

The app should be immersive but still highly readable and productive.

## 2. Core Visual Principles

- Dark-first UI only for Phase 1.
- Thin white/near-white borders as primary structure language.
- High contrast text with restrained color accents.
- Atmosphere through layered background textures, not noisy decorations.
- Components are self-styled and reusable; pages mostly compose them.
- Avoid novelty CSS per page; theme consistency beats experimentation.

## 3. Color System (Design Tokens)

Use semantic tokens only.

```css
:root {
  --bg-base: #090b10;
  --bg-elev-1: #10141c;
  --bg-elev-2: #151b26;
  --bg-panel: rgba(18, 22, 31, 0.84);
  --bg-terminal: #0b0f12;

  --text-primary: #f2f5f9;
  --text-secondary: #b9c1cf;
  --text-muted: #8a93a6;

  --border-default: rgba(245, 248, 255, 0.28);
  --border-strong: rgba(245, 248, 255, 0.48);
  --border-soft: rgba(245, 248, 255, 0.16);

  --accent-steel: #8fa3bf;
  --accent-cyan: #63d4ff;
  --accent-ember: #e39a63;
  --accent-violet: #9286ff;

  --state-success: #5fd1a8;
  --state-warning: #e4b46f;
  --state-danger: #ef7d7d;
  --state-info: #76b9ff;
}
```

Usage rules:

- White borders are thin and frequent (`1px` baseline).
- Accent colors are sparse; never more than 1 accent family per component.
- Panels prefer layered dark surfaces over solid black blocks.

## 4. Background and Atmosphere

Build depth with layered backgrounds:

1. Base gradient wash (`navy -> charcoal`).
2. Soft radial fog blobs with low opacity.
3. Optional subtle noise texture (`2-4%` opacity).
4. Rare rune/grid overlays for hero/header sections only.

Recommended app background recipe:

```css
background:
  radial-gradient(900px 420px at 12% -8%, rgba(102, 119, 168, 0.18), transparent 60%),
  radial-gradient(700px 360px at 90% 0%, rgba(93, 142, 153, 0.14), transparent 58%),
  linear-gradient(180deg, #0a0d13 0%, #080a0f 52%, #07090d 100%);
```

Do not use:

- bright fantasy gold everywhere
- heavy vignette overlays
- high-contrast textures behind body text

## 5. Border, Radius, and Elevation Language

- Border-first hierarchy: containers separated by thin light borders.
- Radius: mostly `10px-14px`, avoid pill-heavy modern look.
- Elevation via soft cold shadows + border glow, not thick drop shadows.

Token suggestions:

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 14px;

--shadow-panel: 0 10px 30px rgba(0, 0, 0, 0.35);
--shadow-focus: 0 0 0 3px rgba(99, 212, 255, 0.2);
```

## 6. Typography System

Split typography by role:

- Display/headings: serif fantasy tone (example: `Cinzel`, `Cormorant Garamond`)
- Body/UI: modern readable sans (example: `Manrope`, `IBM Plex Sans`)
- Terminal/meta data: monospace (example: `JetBrains Mono`, `IBM Plex Mono`)

Rules:

- Heading serif usage should be restrained and mostly for titles/section headers.
- Body copy always sans for readability.
- Monospace only for metrics, tags, timestamps, command-like actions, and debug/tech blocks.

## 7. Layout and Spacing Standards

- Page structure: CSS Grid (`sidebar + content`) on desktop.
- Internal component alignment: Flexbox.
- Content width constraints prevent stretched dashboards.
- 8px spacing grid across all components.
- Section rhythm should feel “modular console”, not dense admin clutter.

Base spacing scale:

- `4, 8, 12, 16, 24, 32, 40, 48`

## 8. Component Styling Contract

Every shared component must define:

- default, hover, active, focus-visible, disabled states
- loading/empty/error visual state when applicable
- token-only colors and spacing
- border + background + text contrast passing accessibility

Page-level CSS limits:

- Pages can control layout wrappers only.
- Component internals must own their visual style.
- No duplicate “custom card/button/input” styles in pages.

## 9. Terminal-Tech Accent Pattern

Use terminal aesthetic as secondary layer:

- monospace labels for status chips and timestamps
- subtle caret/blink animation only in specific widgets (never global)
- command-like quick actions: `> Start Check-In`, `> Add Task`
- tiny scanline/noise effect only in terminal components

Terminal surfaces:

- use darker panel token (`--bg-terminal`)
- stronger border contrast
- compact spacing and monospace typography

Keep it controlled:

- Maximum one terminal-heavy section per page to avoid visual fatigue.

## 10. Key Component Recipes

### Button

- Primary: dark steel fill + thin bright border + cyan focus ring
- Secondary: transparent/dark panel with white border
- Destructive: muted red accent border, no bright red fills

### Card/Panel

- layered dark background
- 1px light border
- subtle inner highlight top edge
- title in serif or semibold sans depending context

### Inputs

- dark field background
- thin white border default, cyan border on focus
- placeholder in muted text
- optional terminal variant for command/notes experience

### Navigation

- left sidebar with section separators
- active item indicated by border + glow strip, not large filled pills
- icons should be line-based and minimal

### Tables/Lists

- alternating panel shades are subtle
- row separators via soft border token
- metadata text in muted or monospace

## 11. Motion and Interaction

Motion should feel deliberate and calm:

- panel fade/slide on load (`120-220ms`)
- hover transitions (`120ms`)
- minimal transform distances (`2-4px`)
- no bouncy easing for core productivity surfaces

Recommended easing:

- `cubic-bezier(0.22, 1, 0.36, 1)` for panel entrance
- `ease-out` for micro interactions

## 12. Iconography and Illustrative Style

- Icon style: outlined, geometric, low-detail
- Avoid emoji-like or cartoon icon sets
- If adding fantasy motifs (runes/crest), keep them monochrome and sparse

## 13. Accessibility and Readability

- Minimum AA contrast for text and controls
- Focus-visible states always obvious
- Do not encode meaning by color only
- Terminal-style text still must meet readable size and spacing

## 14. Theming Implementation Plan

1. Define token files:
- `tokens.css` for colors, spacing, radius, shadow, typography, z-index

2. Add theme utility classes:
- `surface-panel`, `surface-terminal`, `border-ornate`, `text-mono-meta`

3. Build component library first:
- Button, Input, Select, Textarea, Card, Modal, Badge, Tabs, Table, Empty/Error/Loading states

4. Apply shell and background system:
- global atmospheric background and app shell grid

5. Enforce via lint/review checklist:
- no hardcoded colors
- no page-level one-off button/card/input styles

## 15. Brainstorm: Achieving the Exact “Odyssey” Feel

Use this mix to avoid looking generic or cosplay-heavy:

- Medieval tone: serif headers, crest-like section dividers, iron/stone-inspired surfaces
- Dungeon tone: dim layered lighting, mist gradients, restrained warm ember accents
- Tech nerd tone: monospace telemetry, command-like quick actions, crisp border grids

What to avoid:

- Overly decorative fantasy ornaments on every component
- Pure neon cyberpunk palette
- Flat black-only UI with no depth

North-star test:

- If a screenshot looks like a premium productivity dashboard first, and a fantasy-tech world second, the balance is right.
