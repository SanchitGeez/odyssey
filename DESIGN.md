---
name: Odyssey
description: A dark sanctuary for daily commitments, purposeful planning, and reflection.
colors:
  bg-base: '#0c1110'
  bg-secondary: '#121916'
  bg-panel: '#171e1a'
  bg-panel-strong: '#1b231e'
  bg-terminal: '#101612'
  bg-elevated: '#242d25'
  text-primary: '#eeeae0'
  text-secondary: '#c3c5b8'
  text-muted: '#a5ae9f'
  border-soft: '#30392f'
  border-default: '#4d5746'
  border-strong: '#ad8d52'
  accent-gold: '#d5b675'
  accent-gold-dim: '#322c20'
  accent-silver: '#bbc2b4'
  accent-red: '#d98f89'
  cat-body: '#9cc5a4'
  cat-mind: '#a5b8e1'
  cat-work: '#d5b675'
  cat-wealth: '#dfbc83'
  cat-connection: '#e3a0a5'
  cat-meaning: '#c5b2de'
  state-success: '#a5cba7'
  state-warning: '#dfbc83'
  state-danger: '#f0a59b'
typography:
  display:
    fontFamily: '''Cinzel'', Georgia, serif'
    fontSize: clamp(27px, 3vw, 38px)
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: -.02em
  headline:
    fontFamily: '''Cinzel'', Georgia, serif'
    fontSize: clamp(28px, 3.3vw, 43px)
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -.025em
  title:
    fontFamily: '''Manrope'', sans-serif'
    fontSize: 19px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: -.02em
  body:
    fontFamily: '''Manrope'', sans-serif'
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: '''Manrope'', sans-serif'
    fontSize: 13px
    fontWeight: 600
  journal:
    fontFamily: '''Literata'', Georgia, serif'
    fontSize: 19px
    fontWeight: 400
    lineHeight: 1.85
rounded:
  sm: 8px
  md: 12px
  lg: 16px
spacing:
  space-1: 4px
  space-2: 8px
  space-3: 12px
  space-4: 16px
  space-5: 24px
  space-6: 32px
  space-7: 40px
  space-8: 64px
components:
  button-primary:
    backgroundColor: '{colors.accent-gold}'
    textColor: '#171d14'
    rounded: '{rounded.sm}'
    padding: 11px 20px
    height: 46px
  button-primary-hover:
    backgroundColor: '#e3c78e'
  button-secondary:
    backgroundColor: '#20291f'
    textColor: '#e4dfce'
    rounded: '{rounded.sm}'
    padding: 11px 20px
    height: 46px
  button-danger:
    backgroundColor: '#542d29'
    textColor: '#ffd3c9'
    rounded: '{rounded.sm}'
    padding: 11px 20px
    height: 46px
  input:
    backgroundColor: '#101711'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.sm}'
    padding: 11px 14px
    height: 46px
  navigation-link:
    textColor: '{colors.text-muted}'
    rounded: '{rounded.sm}'
    padding: 10px 14px
    height: 48px
  dimension-chip:
    backgroundColor: '#ffffff04'
    rounded: 6px
    padding: 5px 9px
  task-card:
    textColor: '{colors.text-primary}'
    rounded: '{rounded.md}'
    padding: 22px 24px
  dimension-select:
    backgroundColor: '#101711'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.sm}'
    padding: 9px 13px
    height: 50px
  journal-scroll:
    backgroundColor: '#20231d'
    textColor: '#e1dbc9'
    padding: 44px clamp(24px,6vw,76px) 52px
  checkin-card:
    textColor: '#f1ecdc'
    rounded: '{rounded.lg}'
    padding: 30px 32px 24px
  quest-detail-panel:
    backgroundColor: '#1a221b'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.lg}'
    width: min(600px, calc(100vw - 24px))
  dimension-radar:
    backgroundColor: '{colors.bg-panel}'
    textColor: '{colors.text-secondary}'
    width: 100%
  select-field:
    backgroundColor: '#101711'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.sm}'
    padding: 9px 13px
    height: 48px
  select-menu:
    backgroundColor: '#202a20'
    textColor: '#e2e3d3'
    rounded: '{rounded.md}'
    padding: 6px
  select-option:
    textColor: '#e2e3d3'
    rounded: 7px
    padding: 9px 11px
    height: 44px
  journal-title:
    textColor: '#f0e7d3'
    padding: '0'
---

# Design System: Odyssey

## Overview

**Creative North Star: "The Dark Sanctuary"**

Odyssey is a personal journey through a dark sanctuary. Charcoal olive working surfaces, ivory text, burnished gold, and subtle colored light make daily commitments feel considered and close at hand. Classical artwork carries the emotional world while clear controls support everyday work. The application is deliberately dark only, following the user's brief.

This is an Operate product: phone check-ins, desktop planning and writing, and responsive access to every route. The identity is code-led from the approved textual direction; no UI raster comp is an approved layout authority. Keep the Odyssey name and current route paths. Sanctuary material belongs around a stable working foreground, with restrained movement and consistent category identity.

**Key Characteristics:**

- Charcoal olive, ivory, and restrained burnished gold.
- Classical display lettering, practical controls, and literary long-form prose.
- Original bronze, temple, and sunset-voyage artwork with adjacent provenance.
- One shared family of six colored dimension emblems.
- Clear selections, visible focus, and generous phone targets.

The implementation is documented from `client/src/index.css`, `client/src/checkin.css`, `client/src/pages/journal.css`, `client/src/quest.css`, `client/src/components/dimension-radar.css`, and the shared layout and dimension components. The direction contract is `.impeccable/surfaces/application.md`. Frontmatter records current values; extension metadata and self-contained component previews live in `.impeccable/design.json`.

## Colors

Charcoal olive establishes calm, ivory carries reading, and burnished gold marks primary action and selection. The frontmatter uses the source CSS variable names without their leading dashes.

### Primary

- **Burnished Gold** (`accent-gold`): primary buttons, focus outlines, progress, and active emphasis. `accent-gold-dim` supports quiet gold surfaces; `border-strong` gives restrained warm definition.

### Secondary

- **Dimension Colors** (`cat-body`, `cat-mind`, `cat-work`, `cat-wealth`, `cat-connection`, `cat-meaning`): the shared Vitality, Psyche, Prowess, Wealth, Alliance, and Legacy identities. Keep their label/emblem pairing; color alone never supplies the category name.
- **Status Colors** (`state-success`, `state-warning`, `state-danger`): feedback and operational state. `accent-red` is the warmer secondary red accent; it does not replace the danger feedback token.

### Neutral

- **Olive Black** (`bg-base`): the full application canvas. `bg-secondary` and `bg-terminal` support recessed surroundings.
- **Sanctuary Panels** (`bg-panel`, `bg-panel-strong`, `bg-elevated`): ordinary, stronger, and raised working surfaces.
- **Ivory / Quiet Sage** (`text-primary`, `text-secondary`, `text-muted`): foreground hierarchy. Muted remains readable content, not an excuse for decorative low contrast.
- **Olive Seams** (`border-soft`, `border-default`): dividers and ordinary control definition. `accent-silver` supports pale neutral accents.

**The Working Foreground Rule.** Keep text and controls on stable dark working surfaces; atmospheric artwork supports their hierarchy.

Representative opaque source color pairs were measured in `cook/review-final.md`: primary panel text (14.13:1), secondary (9.70:1), muted (7.40:1), input placeholder (7.57:1), journal prose (11.50:1), journal date (7.71:1), and primary button text (8.82:1). These are partial pair calculations, not full rendered-page contrast or WCAG certification.

## Typography

**Display Font:** Cinzel with Georgia and serif fallbacks. Self-hosted weights (500, 600).

**Body / Control Font:** Manrope with sans-serif fallback. Self-hosted weights (400, 500, 600, 700). The legacy `--font-mono` name also resolves to Manrope; no separate monospace family is established.

**Journal Font:** Literata with Georgia and serif fallbacks, self-hosted regular and italic (400).

Cinzel adds classical gravity to major headings without making every interface label ornamental. Manrope keeps small controls and operational text direct; Literata gives reflection a slower reading rhythm. Fonts are imported from local `@fontsource` packages in the root stylesheet.

### Hierarchy

- **Display:** the frontmatter `display` role is the standard page title; on phones the shared page title becomes (28px), with check-in's compact route heading (22px).
- **Headline:** the frontmatter `headline` role is the check-in introduction. The phone version settles at (28px).
- **Title:** the frontmatter `title` role follows task titles; the phone variant is (18px). General section headings use Manrope (19px, 500, line-height 1.5).
- **Body:** the frontmatter `body` role governs ordinary reading. Subtitles use (14px, line-height 1.7), and text widths are constrained locally, including page subtitles (52ch) and task descriptions (60ch).
- **Label:** the frontmatter `label` role governs field names. Controls use explicit selected and disabled states rather than uppercase styling everywhere.
- **Journal:** the frontmatter `journal` role is sustained prose; phones use (18px) while preserving line-height (1.85). Writer and reader share title styling (clamp(28px,3vw,36px), weight 500, line-height 1.4, letter-spacing -.02em); phone titles use (27px, line-height 1.45). Both share the same prose scale. Internal prose headings use Cinzel; quotation prose is italic.
- **Brand:** desktop Odyssey is Cinzel (25px, letter-spacing .06em); the secondary Chronicle label is Manrope (11px, letter-spacing .19em). Preserve the existing wordmark treatment.

**The Three Voices Rule.** Use Cinzel for classical headings, Manrope for controls and ordinary reading, and Literata for sustained reflection.

## Layout

The desktop shell has a sticky full-height rail (232px), utility bar (76px), and a centered main area capped at (1440px). Normal main padding is (32px 42px 64px). At widths up to (1120px), the rail becomes (200px), main padding becomes (26px), and utility padding follows it. At widths from (1600px), main horizontal padding becomes (60px) and illustrated headers grow from their usual minimum (230px) to (260px). Short desktop heights up to (850px) tighten the rail's vertical rhythm.

At widths up to (900px), the rail disappears, the utility bar is (70px), and fixed five-destination bottom navigation takes over. It includes safe-area padding, while main content reserves bottom space (112px) and toasts sit above navigation. Shared two-column grids collapse; quest details are a click-open right-side panel rather than a permanent second column. Main navigation remains `/check-in`, `/tasks`, `/quests`, `/journals`, and `/insights`; account navigation retains `/settings` and `/help`. Authentication retains its existing routes including `/login`.

At widths up to (640px), main padding becomes (18px 16px 112px), the utility bar becomes (66px), headers wrap, ordinary cards use (20px) padding, and three-column grids become single-column. Task search spans both columns above its two filter controls. Task filters preserve their bottom gap (24px). Insights dates use two columns and a full-width apply action, then one column at (360px) and below. The document minimum width is (320px).

The check-in and focused journal have an additional phone adjustment at (767px). The check-in workspace is capped at (500px) on desktop and (440px) on phones. Its phone landscape is anchored right/top at an intrinsic artwork height (300px), preserving the sunset traveler while fading into the base behind the response card. Do not cover the scene with an opaque banner or stretch it to the card's full height.

The journal has its own full-viewport workspace with a fixed topbar. `ResizeObserver` measures its actual height into `--journal-header-height`; matching workspace top padding and prose scroll margins keep the page and active writing clear of the header. CSS fallbacks are (72px) on desktop and (94px) at (767px) and below; they are not fixed assumptions once the header is measured. The desktop command row uses three columns with minimum height (44px), header padding (12px clamp(16px,3vw,48px)), and a centered save status. Phones use a compact command row with save status beneath it.

The writing area is capped at (860px) with side clearance (48px), outer margins (48px auto 64px), and the frontmatter scroll padding. At (767px) and below, clearance becomes (32px), outer margins (24px auto 40px), and paper padding (28px 22px 38px). At widths up to (359px), clearance is (24px). Desktop scroll caps are (10px) high; phone caps are (8px). The paper contains date, title, and prose. Formatting belongs in the header and entry context in a drawer.

Format starts collapsed. Opening it reveals one horizontal, non-wrapping, scrollable toolbar in the fixed header, capped at (1120px), with square tools (44px) and a Text style trigger (126px desktop, 132px phone). Link tools are portaled with the formatting panel into the same header host, capped at (800px); they never enter the paper. Header measurement responds when the toolbar, link form, or error feedback changes its height. Entry details, word count, last-saved time, dimensions, and tags live in the separate Entry details SlideOver.

Insights places its hexagonal chart beside a numeric legend in a two-column grid with a gap (36px), tightening at (1100px) and stacking at (767px). The chart uses viewBox (360 × 340), maximum width (420px; 360px on phones), quiet olive grid rings, translucent gold fill, and gold outline.

Use the frontmatter spacing scale for shared rhythm; the source also has local component measurements. Do not force every established local measurement onto a different scale.

## Elevation & Depth

Depth combines olive tonal layering, small warm gradients, and selective shadow. Ordinary panels remain grounded. The lifted commitment stack, journal scroll, dialogs, menus, and toast feedback have explicit depth. The sidebar is one continuous background, not a floating card.

### Shadow Vocabulary

- **Panel** (`--shadow-panel`): dialogs and account popovers; exact source value is carried in the sidecar.
- **Lift** (`--shadow-lift`): floating toast feedback.
- **Gold** (`--shadow-gold`): the available restrained warm shadow token.
- **Button hover:** a small warm lift with a translation of (-2px).
- **Journal scroll:** a broad soft shadow below the writing surface, with smaller shadows under rolled caps.
- **Check-in card:** a soft dark shadow over a slightly rotated underlay (-1.5deg).

Layer ordering is canvas (0), navigation (10), account/utility (20), modal (40), shared select portal (45), toast (50), and focused skip link (60). Keep controls inside the scene above its decorative layers; the scene must not intercept input.

**The Quiet Depth Rule.** Use tonal separation at rest and reserve stronger lift for floating surfaces, focused writing, and deliberate interaction.

State transitions generally run (160–220ms). Route content enters with opacity and a small upward movement over (360ms); panels enter over (380ms), exit over (180ms), and toasts enter over (300ms). The source uses `ease-out` and `ease-spring` curves recorded in the sidecar. Navigation's shared active indicator uses a spring (stiffness 420, damping 38). Check-in responses also use application motion; do not treat screenshots as verification of its timing. Global reduced-motion rules disable CSS animation and transitions, and route/auth entrances respect `useReducedMotion`.

## Shapes

Compact rectangular controls use the small radius; task and ordinary cards use the medium radius; the check-in scene, commitment cards, dialogs, and slide panels use the large radius. The frontmatter contains the exact root scale. Local badge and picker geometry retains its smaller corners (5–7px), while avatars and completion marks are circular. The journal scroll is a broad flat writing sheet with narrow rolled caps rather than another nested rounded card.

Borders are thin, quiet olive seams; active and focused controls move toward gold. Primary buttons are solid warm gold. The dimension SVG family uses a shared viewBox (32 × 32), rounded strokes and joins, and stroke width (1.55). Keep its proportions intact at small sizes.

## Components

### Buttons

Confident, compact, and plainly labeled. Primary buttons use the frontmatter primary treatment, minimum height (46px), Manrope (13px, 700), and icon/text gap (9px). Hover warms the fill, lifts (-2px), and adds a restrained gold shadow; active scales to (.97). Secondary actions use olive fill and a defined stroke; destructive actions use dark red with pale warm text. Disabled buttons reduce opacity (.5) and change cursor. Shared focus is a gold outline (2px) offset (4px). Icon buttons have a generous square target (44px).

### Inputs / Fields

Dark recessed fields with visible labels, small-radius corners, a thin olive stroke, and minimum height (46px). Ordinary input text is (16px) with line-height (1.5); labels sit above with a gap (7px). Hover strengthens the stroke; focus turns it gold and uses an outline offset (2px). Placeholders remain legible. Errors use the danger state and nearby text. Textareas resize vertically and begin at minimum height (110px).

### Selects / Filters

Every task, quest, onboarding, category, and journal Text style dropdown uses the shared `SelectField` primitive. Menu surfaces are opaque olive with pale labels, warm gold checks, and gold highlighted/selected rows; browser-blue native menus are not part of this interface. Keep familiar field labels and values while using the common themed treatment.

The shared trigger has minimum height (48px), padding (9px 13px), a small-radius border, and a caret that rotates when open. Hover strengthens the olive stroke and fill; open state turns the stroke gold. Portaled menus have a medium radius, padding (6px), a thin olive stroke, the shared menu shadow, maximum height (380px or available space), side offset (7px), and viewport collision padding (12px). Options have minimum height (44px), padding (9px 11px), and smaller corners (7px). Preserve disabled states, scroll buttons, keyboard selection, visible focus, and background inertness while a menu is open. Task filters use slightly smaller text (14px) and horizontal padding (12px); the journal Text style trigger uses its header-specific size. The category wrapper keeps its larger trigger and original colored emblem pills.

### Navigation

The desktop rail places wordmark, five main destinations, mantra, secondary links, and account footer over the continuous full-height artwork. The source `/art/sidebar-sanctuary.webp` is the dedicated portrait bronze helmet/column composition, positioned at (61% center) with cover sizing and a dark gradient overlay. This replaces the earlier inset tile. Preserve quiet upper space behind labels and the visible bronze composition below. Links have minimum height (48px), small-radius corners, subtle hover fill, and a warm active label with inset translucent gold backing.

Mobile navigation has five equal destinations, icons above labels, minimum link height (52px), current-state backing, and safe-area padding. The utility account menu keeps settings, help, and sign-out reachable; Escape closes it and returns focus. Preserve the visible skip link and main landmark target.

### Chips / Dimension Identity

One original emblem family is reused through `DimensionMark`, `DimensionLabel`, and the category selector:

- **Vitality:** laurel branch; `cat-body`.
- **Psyche:** owl; `cat-mind`.
- **Prowess:** sword; `cat-work`.
- **Wealth:** stacked coins; `cat-wealth`.
- **Alliance:** clasped hands; `cat-connection`.
- **Legacy:** classical temple; `cat-meaning`.

Keep a readable name beside each emblem. Filters, task and check-in metadata, journal chips, and help all preserve this family. Task metadata gives the emblem a quiet tinted square. Journal chips use visible active borders and warm selected fill. Category selection wraps the shared `SelectField`, preserving its labeled emblem pills. Category triggers have minimum height (50px); shared option rows have minimum height (44px). Highlighted and checked states are distinct. The keyboard-aware portal has collision spacing, a capped height, and a warm selected checkmark. Do not replace category emblems with generic dots or unrelated icon-library glyphs.

### Cards / Containers

Ordinary panels use the frontmatter panel color, medium radius, and padding (26px; 20px on phones). Task cards use a quiet olive gradient, thin stroke, and their frontmatter padding. A readable title, category, schedule/status, and History/Edit controls establish the hierarchy. Task cards contain no images. Artwork belongs to the surrounding header and application world. Hover strengthens the card stroke and olive tone without moving the task layout.

### Check-In

The daily commitment is a focused foreground card with a slightly rotated underlay, clear progress, dimension emblem, Cinzel title, practical response text, and persistent Skip/Done buttons. Phone response targets have minimum height (48px). Swipe is an enhancement with a visible button alternative. Retain complete, empty, loading, save-error/retry, and optional value-entry presentations without replacing their real data semantics with decorative metrics.

### Journal Scroll

The broad olive scroll is a quiet page: date, title, and prose only. Writer and reader share paper geometry, Cinzel title styling, and Literata prose. The writer title is an auto-growing textarea whose height follows text, available width, and loaded fonts. The editor and reader both begin at minimum prose height (340px). Do not place formatting controls, category chips, tags, word counts, or save timestamps inside the paper.

The fixed topbar carries back navigation, live save status, Format, Entry details, focus mode, and Save & close. Format is collapsed by default; its one horizontal toolstrip can scroll on small screens. Retain paragraph/heading selection, bold, italic, bullet and numbered lists, checklist, quotation, link tools, undo, and redo. The toolbar and its link form are portaled into the header host. Tools remain (44px) squares, with accessible names, selected states, and visible focus. Selecting a Text style restores editor focus. Checklist items align checkbox and wrapping text in one row with a generous label hit area.

Entry details opens a separate SlideOver containing word count, last-saved time, the six shared dimension chips, and comma-separated tags. Metadata edits autosave with writing. Reader details show the same context and the delete action; the reading topbar offers Details and Edit entry. Focus mode closes Format and increases the available prose height without placing context back on the page. Save-error/retry feedback stays in the header, and its measured height keeps the document clear. Preserve dirty-state navigation protection and the explicit save, keep-writing, and discard choices.

The library uses clean rows with excerpts and dimension labels rather than nesting writing cards inside cards.

### Quest Details

The quest library remains a single working list. Clicking a specific quest card opens its details in the shared right-side SlideOver; the title is the semantic button, with its hit area stretched across the card, while Edit/Delete remain separate controls; no quest is automatically opened and no permanent detail column is shown. The selected card is marked only while that quest's panel is open. Hover lifts the card (-2px), warms its olive fill, and strengthens its border; focus outlines the full card, and reduced motion suppresses the transform. Keep milestone editing, progress, success criteria, updates, and activity within the panel, including loading and retry states. The shared panel uses large-radius corners, olive fill, a thin stroke, panel shadow, modal overlay, a separate scrolling body, and a visible close button. Radix handles the modal structure; close returns focus to the invoking control. The quest-specific override in `client/src/quest.css` sets the frontmatter `quest-detail-panel` width; other shared slide panels retain their generic width (520px). At (640px) and below, the quest drawer fills the viewport with no inset, border, or rounded corners and maximum height (100dvh). Inside it, detail sections are one uninterrupted workspace with a gap (28px), transparent section surfaces, and thin separators instead of nested cards.

### Life Dimensions Hexagon

The Insights hexagon represents **follow-through: completed actions ÷ actions due × 100**, across the last 28 finished days in the user's timezone. Preserve the label “Follow-through over the last 28 finished days.” All six axes use a fixed 0–100% scale. Its window is independent of the recorded-activity date controls, which sit below it. These are commitment completion percentages, not life-health ratings.

Four hexagonal grid rings establish the scale. The gold polygon and point positions use actual percentages. A dimension with nothing due shows “No data” and has no plotted point; only draw the filled polygon when all six dimensions have data, otherwise connect adjacent measured points without bridging gaps. A measured 0% remains distinct from missing data. Axis labels repeat category names and percentages. The adjacent six-row legend uses the shared colored emblems, completed/due counts, and tabular percentages. The caption shows the fixed scale and actual scoring dates. Its note explains skips, misses, weekly deadlines, and excluded undated tasks and quests. Preserve SVG title/description text, loading skeletons, an independent retry action, and empty-state links. The chart is code-rendered SVG rather than generated artwork; its accessible description reports each percentage, counts, and missing dimensions.

### Artwork / Provenance

Shipping art is original generated imagery. Main assets are `client/public/art/bronze.webp`, `sanctuary.webp`, `voyage.webp`, `last-light.webp`, and `sidebar-sanctuary.webp`; six category vignettes live under `client/public/art/dimensions/`. Every raster has adjacent `.webp.json` provenance containing its generation prompt and `createdAt`. Keep these files together. The sidebar prompt explicitly records derivation from the supplied bronze artwork into one tall architectural composition. The inline SVG category emblems are original code-drawn marks rather than raster replacements.

Use art as atmosphere and meaningful orientation: bronze for tasks, sanctuary for quests and authentication, voyage for the journal library, last light for check-in and insights, and category vignettes in explanatory help. Decorative header images use empty alternative text; the authentication scene carries a descriptive alternative. Do not infer approval of a UI raster layout from the existence of artwork references.

The r02 finish review in `cook/review-final.md` records **ship** for its reviewed visual scope across 21 captures. The restored hexagon, click-open quest panel, themed select fields, and Zen journal received **ship** in the scoped `cook/review-additions.md` review across 19 affected-view captures, with no open material visual fixes. These judgments do not certify motion or every interaction/state. Real Safari and touch-device review, screen-reader coverage, and full contrast certification remain outside this static finish judgment.

## Do's and Don'ts

### Do:

- **Do** reuse the root CSS tokens and the existing typography roles.
- **Do** preserve all six dimension emblems, names, and colors in labels, filters, journal chips, help, and category pickers.
- **Do** retain the full-height bronze and column sidebar scene with a readable navigation foreground.
- **Do** leave the established 24px gap below the task filters.
- **Do** preserve the phone check-in traveler and sunset above the commitment card, with visible Skip and Done controls.
- **Do** keep original raster provenance beside every shipping image and honor reduced-motion preferences.

### Don't:

- **Don't** add images inside task cards.
- **Don't** substitute generic dots, emoji, or unrelated icons for the six custom category emblems.
- **Don't** turn the continuous sidebar scene back into an inset image tile.
- **Don't** replace the dark-only brief with an invented light theme.
- **Don't** stretch phone check-in art to card height and crop away its traveler.
- **Don't** describe partial contrast measurements or static screenshots as full accessibility, motion, Safari, or touch certification.
