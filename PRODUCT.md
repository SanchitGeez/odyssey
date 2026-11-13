# Odyssey

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People tracking personal commitments, habits, larger goals, and reflections across
six life dimensions. The confirmed usage pattern is phone-based daily check-ins
with desktop planning and longer journal writing. Mobile must support every route.

## Product Purpose

Bring recurring tasks, one-time tasks, quests, journals, and activity insights into
one personal life-tracking application. The PRD describes a daily check-in taking
roughly 60-90 seconds; that is a product target, not a measured result.

## Operating Context

- Recurring schedules determine which tasks appear in a daily check-in.
- Task and quest activity record dated history; insights summarize that history.
- Quests contain milestones and remain separate from daily task check-ins.
- The journal supports creating, reading, editing, searching, and tagging entries.
- The frontend is React/TypeScript/Vite; the backend is FastAPI/SQLAlchemy.
- Local Docker services use ports 15173 (web), 18000 (API), and 15432 (PostgreSQL).

## Capabilities and Constraints

- The user has authorized end-to-end UI implementation. Preserve backend
  business rules and existing data.
- Preserve working authentication, existing data, route paths, and API ownership.
- Six dimensions: Vitality, Psyche, Prowess, Wealth, Alliance, Legacy.
- Confirmed journal target: headings, bold/italic, lists, checklists, quotations,
  links, undo/redo, autosave, and focus mode.
- The journal retains its existing string API and stores a versioned rich-text
  JSON document. Legacy plain text stays literal; unsupported formats stay
  read-only. UI search reads decoded content, titles, and tags.
- A mobile zoom problem is user-reported; reproduce on the affected browser before
  claiming it fixed. Swipe check-ins are a requested UI interaction.

## Brand Commitments

- Keep the Odyssey product name. No new logo has been approved.
- User explicitly requests Greek, Roman, Spartan, Odyssey/Iliad inspiration,
  custom-generated imagery, and a modern, elegant, professional application.
- Confirmed voice: disciplined and challenging, without punishment.
- Preserve and evolve the existing dark/gold identity with subdued colored light.
  User approved the dark sanctuary direction: forest temple atmosphere, bronze
  material details, and warm sunset journey moments, with modern smooth motion.

## Accessibility & Inclusion

Accessibility and clear affordances are explicit requirements. Plan for WCAG 2.2 AA,
keyboard and touch parity, readable type, visible focus, labeled controls, reduced
motion, user-controlled zoom, and accessible alternatives to swipe gestures.

## Evidence on Hand

- `specs/PRD.md`: product concepts and current scope.
- `specs/Style-Guide.md`: incumbent visual direction, not approved replacement.
- Current implementation under `client/src/` and `server/app/`.
- User confirmed the tone, device priorities, and journal tools on 2026-11-13.
- Audit captures and the proposed replacement are recorded in the UI overhaul plan.

## Product Principles

- Make the next action understandable and reachable on a phone.
- Make progress clear and resuming easy after a missed commitment.
- Treat writing as a primary workflow with reliable save feedback.
- Let the historical world enrich the product while controls remain familiar.
- Represent only recorded activity as user progress; never invent analytics.
