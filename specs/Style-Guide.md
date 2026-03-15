# Odyssey Styling Guide

**Version:** 2.0
**Date:** March 14, 2026
**Theme Direction:** Assassin's Creed Odyssey cinematic menu UI + heraldic minimalism + life OS clarity

---

## 1. Design Philosophy

### North Star

> The UI should feel like navigating the pause menu of a cinematic AAA game — specifically Assassin's Creed Odyssey — adapted for a life-tracking productivity tool.

### Core Identity

Odyssey is **not** a typical web dashboard. It is a **cinematic life operating system** disguised as a dark productivity app. Every interaction should feel intentional, minimal, and atmospheric.

### Design DNA

| Source | Weight | What It Contributes |
|--------|--------|---------------------|
| AC Odyssey game menus | 40% | Flat text menus, gold underlines, no-card hover, shimmer effects |
| Cinematic heraldic minimalism | 25% | Serif display type, ornamental dividers, symmetry, ceremony |
| Modern product UI | 25% | Readability, accessibility, responsive layout, form patterns |
| Terminal/ops aesthetic | 10% | Monospace metadata, badge chips, compact data display |

### The Balance Test

If a screenshot looks like a premium game settings screen first, a dark productivity tool second, and a fantasy world third — the balance is right.

### What We Are NOT

- Not a generic admin dashboard
- Not a cosplay-heavy fantasy UI with ornaments on everything
- Not a flat Material/Tailwind template with a dark coat of paint
- Not a college project with inconsistent spacing and visible CSS seams

---

## 2. Core Visual Principles

### 2.1 Flat, Borderless, Text-First

The primary interaction language is **plain text on dark backgrounds**. UI elements are defined by typography, spacing, and subtle state changes — not by card borders, shadows, or background fills.

**Do:**
- Let text stand on its own with generous spacing
- Use thin 1px borders only for structural containers (forms, list groups)
- Keep backgrounds transparent or near-transparent

**Don't:**
- Wrap every piece of content in a bordered card
- Use box shadows for elevation
- Add background fills to interactive rows

### 2.2 AC Odyssey Menu Selection Pattern

This is the defining interaction pattern for all selectable items (nav links, list rows, tabs):

**At rest:**
- Plain text, muted color, no background, no border

**On hover:**
- Text brightens (muted → primary white)
- No background change, no border, no card effect

**Active/selected:**
- Text turns gold (`--accent-gold`)
- A thin gold **horizontal underline** appears directly below the text
- The underline fades from solid gold on the left to transparent on the right
- A continuous **shimmer animation** sweeps through the text characters (light gold `#f0d890` glint via `background-clip: text`)

**Key rules:**
- Never highlight the full row/card — only the text responds
- Underlines are always horizontal, never vertical side bars
- Hover underlines expand to 50%; active underlines are full width
- The shimmer is text-only, not a background overlay

### 2.3 Extreme Minimalism in Spacing

Generous whitespace is non-negotiable. The UI must breathe.

- Nav items: thin padding (`4px 0`), generous gap between items (`12px+`)
- List items: compact internal padding, clear separation gap between items (`12px`)
- Cards: padding `24px`, margin between cards `16px`
- Page sections: `32-64px` vertical rhythm

### 2.4 Dark Cinematic Depth

Background is **not flat black**. It's a layered deep blue with atmospheric fog:

```css
background:
  radial-gradient(1200px 700px at 20% -5%, rgba(34, 49, 84, 0.32), transparent 65%),
  radial-gradient(1200px 700px at 85% 8%, rgba(31, 38, 57, 0.26), transparent 66%),
  linear-gradient(180deg, #04060b 0%, #05070d 45%, #070b13 100%);
```

Additional depth layers:
- Subtle vignette via `radial-gradient` on `body::before`
- Faint horizontal scanlines via `repeating-linear-gradient` on `body::after` at ~20% opacity
- Soft radial glow in sidebar and main content area

---

## 3. Color System

### 3.1 Core Palette

```css
:root {
  /* Backgrounds — layered deep blue, never flat black */
  --bg-base: #05070d;
  --bg-secondary: #0a0f1a;
  --bg-panel: rgba(8, 12, 20, 0.74);
  --bg-panel-strong: rgba(10, 15, 25, 0.92);
  --bg-terminal: rgba(7, 11, 18, 0.96);
  --bg-elevated: rgba(14, 19, 30, 0.85);

  /* Text — high contrast, WCAG AA compliant */
  --text-primary: #e8e9ee;
  --text-secondary: #b3b7c1;
  --text-muted: #9399a6;    /* bumped from #838998 for contrast */

  /* Borders — thin, frequent, structural */
  --border-soft: rgba(149, 157, 171, 0.18);
  --border-default: rgba(176, 184, 198, 0.32);
  --border-strong: rgba(201, 164, 76, 0.5);

  /* Gold accent — the signature color */
  --accent-gold: #c9a44c;
  --accent-gold-dim: rgba(201, 164, 76, 0.15);
  --accent-silver: #9ea3aa;
  --accent-red: #8b1e2d;

  /* Life dimension colors */
  --cat-body: #6ea889;
  --cat-mind: #7b93db;
  --cat-work: #c9a44c;
  --cat-wealth: #d4a853;
  --cat-connection: #bd5a67;
  --cat-meaning: #a97bdb;

  /* State colors */
  --state-success: #6ea889;
  --state-warning: #c39f62;
  --state-danger: #bd5a67;
}
```

### 3.2 Color Usage Rules

- **Gold** is the primary accent. Used for: active nav text, selected item underlines, primary button borders, ornamental dividers, streak highlights
- **Category colors** are used only as small dots/indicators next to dimension-tagged content, never as fills or backgrounds
- **State colors** are used only for badges and inline feedback text
- Backgrounds are always transparent or near-transparent — never solid colored panels
- White borders at `0.12` opacity for list items, `0.18` for structural panels

---

## 4. Typography System

### 4.1 Font Stack

```css
--font-display: 'Cinzel', 'Cormorant Garamond', serif;
--font-body: 'Manrope', 'Segoe UI', sans-serif;
--font-mono: 'Spectral SC', 'Cormorant Garamond', 'Georgia', serif;
```

### 4.2 Usage Rules

| Context | Font | Size | Weight | Spacing | Transform |
|---------|------|------|--------|---------|-----------|
| Page title | Display serif | `clamp(1.2rem, 2vw, 1.6rem)` | 500 | `0.2em` | uppercase |
| Section title | Display serif | `0.9rem` | 500 | `0.12em` | uppercase |
| Nav label | Body sans | `0.74rem` | 400/500 | `0.08em` | uppercase |
| Body text | Body sans | `0.82-0.88rem` | 400 | `0.01em` | none |
| Badge/meta | Mono serif | `0.68rem` | 400 | `0.06em` | uppercase |
| Muted label | Body sans | `0.7rem` | 400 | `0.14em` | uppercase |

### 4.3 Restraint Rules

- Serif display font is **only** for page titles, section headers, stat values, and the brand name
- Body copy is always sans-serif for readability
- Monospace is for badges, timestamps, and metadata — never for body text
- All nav and label text is uppercase with letter-spacing

---

## 5. Interaction Patterns

### 5.1 Navigation (Sidebar)

Styled as a flat text menu, not a component sidebar:

```
At rest:     TASKS          (muted gray, no background)
On hover:    TASKS          (white text, half-width underline fades in)
Active:      TASKS          (gold text with shimmer, full underline tapering right)
                ————————
```

Implementation:
- `padding: 4px 0` — thin, not chunky
- `gap: 12px` between items
- No border, no background, no border-radius
- `::after` pseudo-element for the underline: `linear-gradient(90deg, var(--accent-gold), transparent)`
- Active text uses `background-clip: text` with a `repeating-linear-gradient` shimmer animation

### 5.2 Active Item Shimmer

The active nav label has a continuous light-gold glint sweeping through the text:

```css
.ody-nav-link.active .ody-nav-label {
  color: transparent;
  background: repeating-linear-gradient(
    90deg,
    var(--accent-gold) 0%,
    var(--accent-gold) 30%,
    #f0d890 50%,          /* lighter gold shimmer peak */
    var(--accent-gold) 70%,
    var(--accent-gold) 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ody-text-shine 2.5s linear infinite;
}

@keyframes ody-text-shine {
  0% { background-position: 200% 0; }
  100% { background-position: 0% 0; }
}
```

Key: `repeating-linear-gradient` + `background-size: 200%` ensures the animation tiles seamlessly with no stutter or jump on loop restart.

### 5.3 List Items (Tasks, Quests, Journals)

Styled as AC Odyssey settings rows — separated items with thin borders:

```
┌─────────────────────────────────────┐
│  Workout                  Recurring │   ← thin 1px border, no fill
└─────────────────────────────────────┘
                                          ← 12px gap
┌─────────────────────────────────────┐
│  Read 30 minutes          Recurring │
└─────────────────────────────────────┘
```

- Each item has its own `1px solid rgba(149, 157, 171, 0.12)` border
- No border-radius — sharp, flat, rectangular
- Background is transparent at rest
- Hover: very faint white fill `rgba(255, 255, 255, 0.03)` — like AC Odyssey's selected row tint
- Selected: slightly stronger `rgba(255, 255, 255, 0.05)`, text stays white
- No underlines, no gold accents, no lift/shadow — just the quiet tint change
- `gap: 12px` between items in the list

### 5.4 Buttons

- Primary: gold-tinted dark gradient, thin gold border
- Secondary: dark gradient, thin gray border
- Danger: red-tinted dark gradient, thin red border
- All: uppercase, `0.72rem`, `letter-spacing: 0.1em`
- Hover: border brightens, subtle `translateY(-1px)`, shadow lift
- Active press: `scale(0.98)` — quick tactile feedback
- Icon + text pattern: `<Icon size={14} /> Label`

### 5.5 Form Controls

- Dark field background (`--bg-panel-strong`)
- Thin `--border-soft` border
- Focus: gold border + `0 0 0 3px rgba(gold, 0.12)` ring
- Forms live in slide-over panels, not inline on the page

### 5.6 Slide-Over Panel (Modal Alternative)

Forms for creating/editing tasks, quests, and journal entries use a slide-over panel instead of inline forms:

- Slides in from the right edge
- Backdrop blur + dark overlay
- `max-width: 520px`
- Escape to close
- This keeps the main content clean and removes the "admin dashboard" feel

---

## 6. Layout Architecture

### 6.1 Desktop (>1120px)

```
┌──────────────┬─────────────────────────────────┐
│              │                                  │
│   SIDEBAR    │         MAIN CONTENT             │
│   260px      │         flex: 1                  │
│   sticky     │                                  │
│              │   ┌─ Page Title ──────────────┐  │
│   Brand      │   │  + subtitle               │  │
│   Ornament   │   └───────────────────────────┘  │
│   Nav links  │                                  │
│              │   [Content sections]              │
│   Footer     │                                  │
│              │                                  │
└──────────────┴─────────────────────────────────┘
```

### 6.2 Mobile (<1120px)

- Sidebar hidden
- Bottom tab bar with 5 key nav items
- Active tab: gold top-line indicator (`::before` pseudo)
- Content full-width with reduced padding

### 6.3 Check-In (Special Layout)

Check-in is a **full-screen focused flow** — no sidebar, no shell:

```
   ODYSSEY              Today              ✕
   ═══════════════════════════════════════   ← progress bar

                    Card 3 of 7

              ┌─────────────────┐
              │   Body & Vitality
              │
              │    WORKOUT
              │
              │   [Done]  [Skip]
              │
              │   [optional value input]
              └─────────────────┘

          Progress saved — continue later
```

---

## 7. Component Reference

### 7.1 Ornamental Divider

A centered diamond with fading lines — used between brand and nav, and above page titles:

```css
.ody-ornament::before, .ody-ornament::after {
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, transparent, rgba(163, 170, 182, 0.35), transparent);
}
.ody-ornament span {
  width: 8px; height: 8px;
  border: 1px solid rgba(201, 164, 76, 0.5);
  transform: rotate(45deg);
}
```

### 7.2 Card

Used for content containers, stat panels, and forms:

- `1px solid --border-soft` border
- `border-radius: 12px` — subtle, not pill-shaped
- Transparent/near-transparent background with `backdrop-filter: blur(6px)`
- Gold top-edge highlight: `linear-gradient(90deg, transparent, rgba(gold, 0.5), transparent)` via `::after`
- Fade-up entrance animation: `translateY(8px)` → `0` over `400ms`

### 7.3 Stat Card

For insights page metrics:

- Centered layout with icon → large number → label
- Display serif font for the value at `2.4rem`
- Small uppercase label below
- Category/accent color on the icon

### 7.4 Empty State

When a list or section has no data:

- Centered layout with a circle-bordered icon
- Display serif title ("No Tasks Yet")
- Muted body text explaining what goes here
- Optional CTA button

### 7.5 Toast Notifications

- Fixed bottom-right position
- Slide-in from right
- Color-coded left accent: green (success), red (error), gold (info)
- Auto-dismiss after 3.5 seconds
- Icon + message + dismiss button

### 7.6 Badges

- Pill-shaped with thin border
- Variants: default (gray), gold, success (green), danger (red)
- Small category dots (`6px` circles) use dimension colors

### 7.7 Timeline (Quest Activity)

- Vertical line on the left with dot markers
- Date label → activity badge → optional note
- Completed milestones get a green-tinted dot

---

## 8. Motion and Animation

### 8.1 Principles

- Motion is **calm and deliberate** — never bouncy or playful
- Transitions are 200-400ms, eased with `cubic-bezier(0.25, 0.8, 0.25, 1)`
- The only continuous animation is the nav shimmer — everything else is triggered

### 8.2 Catalog

| Effect | Duration | Easing | Usage |
|--------|----------|--------|-------|
| Card fade-up | 400ms | ease-out | Page load, list stagger |
| List stagger | 50ms delay per item | ease-out | Task/quest/journal lists |
| Underline expand | 280ms | ease | Nav hover/active |
| Text shimmer | 2.5s continuous | linear | Active nav label only |
| Slide-over enter | 300ms | ease-out | Form panels |
| Overlay fade | 200ms | ease | Modal backdrop |
| Toast slide-in | 300ms | ease-out | Notifications |
| Button hover lift | 240ms | ease-out | `translateY(-1px)` |
| Button press | instant | — | `scale(0.98)` |
| Progress bar fill | 500ms | ease-out | Check-in progress |
| Skeleton shimmer | 1.5s continuous | ease | Loading placeholders |
| Glow pulse | 2s continuous | ease-in-out | Completion celebration |

### 8.3 No-Go List

- No bouncy spring easing on productivity surfaces
- No scale transforms on hover (except button press feedback)
- No translateY lifts on list items or cards
- No parallax or scroll-linked effects
- No page transition animations between routes (keep it instant)

---

## 9. Accessibility

- Minimum WCAG AA contrast for all text
- `--text-muted` set to `#9399a6` (4.5:1 ratio on `#05070d`)
- Focus-visible states: gold border + `box-shadow` ring
- `aria-label` on all icon-only buttons
- `aria-live="polite"` on toast container
- `role="dialog"` + `aria-modal` on slide-over panels
- Skip-to-content link (planned)
- Color is never the only indicator of meaning — always paired with text or icon

---

## 10. Iconography

- 22 custom inline SVG icons in `components/icons.tsx`
- Style: filled, geometric, 24x24 viewBox
- Used in: nav items, buttons, badges, empty states, stat cards
- Icons inherit `currentColor` — they respond to text color changes automatically
- Opacity modulated: `0.35` at rest, `0.7` on hover, `1.0` when active

---

## 11. What to Avoid

| Anti-pattern | Why | Instead |
|-------------|-----|---------|
| Card-shaped hover effects | Looks like a web dashboard, not a game menu | Subtle tint + text color change only |
| Vertical side bars on selection | Too "IDE sidebar" feeling | Horizontal underlines that taper |
| Heavy box shadows | Breaks the flat cinematic feel | Thin borders for structure |
| Bright accent colors everywhere | Kills the dark atmospheric mood | Gold sparingly, category dots small |
| Rounded pill buttons/badges | Too modern/casual for the theme | Sharp or subtle radius only |
| Forms always visible on page | Admin panel feel | Slide-over panels for creation/editing |
| "Loading..." text | Unprofessional | Skeleton shimmer cards |
| Empty lists with no guidance | Dead-end experience | Empty states with icon + copy + CTA |
| Thick chunky nav items | Looks like a component library demo | Thin text with generous spacing |

---

## 12. Implementation Stack

```
React 19 + TypeScript
CSS custom properties (no Tailwind classes in markup)
Inline SVG icons (no icon library dependency)
Framer Motion (planned for Phase 2 route transitions)
Custom slide-over/modal (no headless UI library)
Custom toast system (no third-party notification library)
```

All styles live in `index.css` using the `ody-` prefix convention. No CSS-in-JS, no CSS modules, no Tailwind utility classes in templates.

---

## 13. File Reference

| File | Purpose |
|------|---------|
| `client/src/index.css` | Complete design system — tokens, components, responsive |
| `client/src/components/icons.tsx` | SVG icon library (22 icons) |
| `client/src/components/layout.tsx` | AppShell, AuthCard, nav with shimmer |
| `client/src/components/modal.tsx` | SlideOver panel |
| `client/src/components/toast.tsx` | ToastProvider + useToast hook |
