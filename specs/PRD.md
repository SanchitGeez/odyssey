---
title: Odyssey Product Requirements Document
version: "1.1"
date: March 2026
status: Stage 1 In Progress
---

# Odyssey Product Requirements Document

**Version:** 1.1
**Date:** March 2026  
**Status:** Stage 1 In Progress

## 1. Problem Statement

People who want to improve their lives face three compounding failures with existing tools:

1. Fragmentation: 10+ apps for different life areas; no unified view
2. Rigidity: habit trackers assume everything is daily; real life is not
3. Punishment: broken streaks, red X's, and shame spirals cause abandonment within 2 weeks

The result: tools that were supposed to help feel like surveillance. People know what they should do but lack a system that flexibly tracks and reflects their actual life back to them.

## 2. Product Vision

> "Life is messy. Your tracker shouldn't be."

Odyssey is a holistic life management app that replaces 10+ fragmented tools with one calm, flexible, non-judgmental space. Users track across 6 life dimensions in 60-90 seconds a day and watch patterns emerge over months.

Ultimate mission: Help people build lives they do not need to escape from.

## 3. Target User

Primary: Tech-savvy 22-35 year olds (India-focused initially) who:

- Have tried and abandoned multiple productivity/habit apps
- Feel overwhelmed by rigid all-or-nothing systems
- Want self-awareness and balance, not just productivity metrics
- Value privacy and own their data
- Use web apps daily; comfortable without native mobile

### Persona: Arjun, 24, Software Developer, Bangalore

- Pain: 10+ apps, data scattered everywhere, guilt when streaks break
- Goal: Fitness, work-life balance, family connection, self-understanding

## 4. Core Concepts

### 4.1 The 6 Life Dimensions

| # | Dimension | Covers |
| --- | --- | --- |
| 1 | 💪 Body & Vitality | Physical health, sleep, nutrition, fitness, environment |
| 2 | 🧠 Mind & Inner World | Mental health, self-awareness, learning, emotional regulation |
| 3 | 💼 Work & Mastery | Career, skills, productivity, purpose |
| 4 | 💰 Wealth & Resources | Money, saving, investing, financial literacy |
| 5 | ❤️ Connection & Belonging | Family, friendships, relationships, community |
| 6 | 🌟 Meaning & Transcendence | Values, purpose, creativity, legacy |

### 4.2 Task Types + Quests (Stage 1)

| Type | Purpose | Tracking |
| --- | --- | --- |
| 🔄 Recurring | Build consistent patterns | Daily check-in cards with streak |
| ✅ One-Time | Complete specific actions that do not repeat | Check-in cards until completed or archived |
| 🎯 Quest (separate module) | Multi-step goal tracking outside daily check-in | Separate Quests page; weekly prompts |

## 5. Product Roadmap Overview

| Stage | Focus |
| --- | --- |
| Stage 1 (Now) | Core tracking: tasks, daily check-in, quests, journal, insights |
| Stage 2 (Next) | Scoring system, XP/gamification, Sage AI mentor |
| Stage 3 | Community features, accountability circles, public sharing |
| Stage 4 | Deep AI integration, integrations (Calendar, Health, Banking) |
| Stage 5+ | Enterprise / B2B wellness, monetization |

## 6. Stage 1 MVP: Feature Requirements

### 6.1 Authentication & Accounts

- Email/password registration and login
- JWT-based session with token persistence
- Protected routes with redirect
- Status: In Progress (implemented; hardening in progress)

### 6.2 Task Management

Users can create, edit, and delete recurring + one-time tasks across all 6 categories.

#### Recurring Tasks

- Frequency options: Daily | Specific days (for example, Mon/Wed/Fri) | X times per week | Once per week
- Assigned to one of the 6 categories
- Appear in daily check-in on their scheduled days
- Contribute to category health scores

#### One-Time Tasks

- Timing options: Specific due date | Sometime this week | Sometime this month | No deadline
- Appear in daily check-in every day within the valid window
- Do not penalize streak until past due date
- Auto-archive on completion

#### Quests (Single Standard Type in Phase 1)

- One quest model for Stage 1 (no backend quest sub-types)
- Separate Quests page; do not appear in daily check-in
- Weekly or bi-weekly prompts on the Quests page
- Progress tracked via free-text updates plus milestone/checkpoint events
- Future phases may add specialized quest sub-types if product complexity requires it

#### Task Suggestions Library

- Per-category pre-populated suggestions for recurring + one-time task types
- User can select a suggestion (pre-fills form) or create custom
- Examples per category provided in the product description

### 6.3 Daily Check-In

The core 60-90 second interaction. Card-based UI showing only tasks due today.

#### Flow

1. User opens app and sees "X cards to review today"
2. Cards present one at a time with category label
3. Recurring and one-time cards: `[Done ✓]` / `[Skip ✗]`
4. Data-input cards (for example, expense tracking): inline input field plus `Save` / `Skip`
5. One-time task completion: `[Done - Archive]` / `[Skip for now]`
6. Progress bar shows cards remaining
7. After all cards: completion screen with streak count and summary

#### Flexible Task Logic

- "3x per week" tasks: card shows daily until weekly target is met; disappears when met; resets Monday
- "Sometime this month" tasks: show every day in the month; no streak penalty until month end
- Overdue tasks: highlighted but still actionable (`mark done` / `extend deadline` / `archive`)

#### Streak Rules

- Streak = number of consecutive days a user opened and responded to all cards
- Skipping tasks does not break streak; showing up is what counts
- Missing the entire check-in breaks streak
- On return after missed days: "Welcome back. Your X-day streak ended. [Start fresh] [Quick catch-up]"

#### Backend Tracking Decisions (Phase 1)

- Daily check-in items are generated dynamically per request (no stored cards table)
- Task definition state is stored in `tasks`
- Responses/progress/status updates are stored in `task_activity`
- Optional `checkin_days` table is used for fast streak and heatmap queries

### 6.4 Quests Page

Dedicated page separate from daily check-in.

#### Features

- List of all active quests
- Progress timeline visualization (% complete + update history)
- Weekly or bi-weekly prompt: "How's [quest] going?"
- Free-text progress entry field
- Milestone/checkpoint updates
- All past updates in chronological order
- Success criteria visible at the top

### 6.5 Journal

Free-form writing space for reflection and notes.

#### Features

- Rich or plain text entry, no structure required
- Optional category tagging (one or more of the 6)
- Timestamped entries
- Full-text search across all entries
- Appears in Activity Timeline
- Use cases: gratitude, weekly reflection, random thoughts, emotional processing

### 6.6 Insights Overview (previously Dashboard)

#### Sections

- Streak Display: Global check-in streak, visual calendar heatmap
- Hexagon Visualization: Six-axis chart showing category health scores
  - 🟢 Green (7-10), 🟡 Yellow (4-6), 🔴 Red (1-3)
  - Tap a category to drill into its tasks + scores
- Quick Actions: Start today's check-in, add new task
- Active Quests Summary: Name + progress % for each active quest
- Activity Timeline: Chronological feed of task completions/skips, quest updates, and journal entries; filterable by category/type

#### Category Health Score (Auto-Calculated)

- Weighted average of recurring habit completion rate, one-time task completion, quest progress signals, and recent activity level

#### Backend Analytics Decisions (Phase 1)

- No precomputed `insight_snapshots` table in V1
- No generic global `activity_events` stream in V1
- Insights are generated by query-based analysis over:
  - `tasks` + `task_activity`
  - `quests` + `quest_activity`
  - `journal_entries`

### 6.7 Onboarding

- No signup required to try (if local-storage MVP) or simple email signup for cloud
- 3-step intro: explain 6 dimensions -> explain recurring/one-time tasks + quests -> create first task
- Guided task creation with suggestion library
- First check-in walkthrough

### 6.8 Data Export

- Full export of all user data as JSON or CSV
- Available from settings at any time
- Privacy-first: no analytics on personal data

## 7. Stage 2: Next Features

### 7.1 Scoring & Gamification

#### Category Score Formula

`Category Score = (Habit Consistency × 40%) + (Quest Progress × 30%) + (Subjective Feel × 30%)`

- Subjective feel: user self-rates monthly during review
- Life Balance Score = average of all 6 category scores

#### XP & Levels

- Earn XP for:
  - check-in completion (+10)
  - recurring task (+2)
  - one-time task (+5)
  - quest update (+15)
  - journal (+8)
  - streak milestones (50 / 200 / 1000 XP)
- 20 levels from Beginner -> Guru; level-up unlocks themes, advanced analytics, and Sage
- XP penalty for missed check-ins (soft, never below 0)

#### Streak Gamification

- Streak Freeze consumable (earn 1 per 7 days, max hold 2); auto-activates on missed day
- Escalating notifications: morning reminder -> evening nudge -> 11 PM urgent warning
- 1 "Forgiveness Day" per month (life happened, streak preserved)
- Maintenance Mode: lower targets, no streak pressure for declared weeks

#### Achievements & Badges

- Streak: Week Warrior (7d), Month Master (30d), Century Club (100d), Year Legend (365d)
- Category: Body Builder, Mind Master, Wealth Wizard, Connection King
- Task: Task Slayer (100 one-time), Quest Pro (10 quests), Journal Junkie (100 entries)
- Special: Balanced Life (all categories 7+), Experimenter (20 experiments)

All gamification is opt-out. Users can disable XP, notifications, and leaderboards independently.

### 7.2 Sage: AI Mentor

Sage is an optional AI companion with full RAG context of the user's journals, completions, quest updates, and category scores.

#### Core Behaviors

- Context-aware, never generic ("You skip workouts on Thursdays; your journal says those are your busiest work days")
- Socratic, not prescriptive; asks questions that lead to self-discovery
- Pattern detection: surfaces correlations a user would not notice (for example, "Connection drops every time Work exceeds 8/10")
- Emotionally intelligent; adjusts tone based on journal sentiment

#### Features

- Chat tab: On-demand conversation, references the user's own words
- Weekly insights (Sunday): Automatically surfaces the week's patterns plus one probing question
- Monthly review: Identifies the dominant pattern from 30 days of data
- Proactive nudges: streak burnout detection, values-alignment check, quiet celebration of progress
- Ethical guardrails: No medical advice, respects "stop", no manipulation, transparent about AI context used

Technical: RAG over user data (vector embeddings), Claude/GPT-4 for conversation, local or E2E-encrypted cloud storage for embeddings.

## 8. User Stories

### Epic 1: Task Creation

#### US-01

As a user, I want to create a recurring task with custom frequency (daily / specific days / Nx per week) so I can track habits that do not happen every day.

**Acceptance:** Task form shows a frequency picker; Mondays, Wednesdays, and Fridays produce exactly 3 check-in cards per week.

#### US-02

As a user, I want to create a one-time task with a flexible due window ("sometime this month") so I am not forced to commit to a specific date for low-urgency actions.

**Acceptance:** Task appears in check-in every day within the window; does not impact streak until the window closes.

#### US-03

As a user, I want to create a quest with success criteria and optional target date so I can track meaningful goals without it cluttering my daily check-in.

**Acceptance:** Quest is visible on the Quests page only; daily check-in cards are unaffected; timeline shows updates chronologically.

#### US-04

As a user, I want to create a quest with optional milestones/checkpoints so I can track multi-step goals with visible progress.

**Acceptance:** Progress updates are visible on Quests page and Insights summary.

#### US-05

As a user, I want to see suggested tasks when I pick a life category so I do not face a blank slate when getting started.

**Acceptance:** Category selection triggers a suggestion list; tapping a suggestion pre-fills the form; custom creation is still available.

### Epic 2: Daily Check-In

#### US-06

As a user, I want to complete my daily check-in in under 90 seconds so tracking does not become a burden.

**Acceptance:** P95 of check-in sessions complete in <= 90 seconds; median <= 60 seconds.

#### US-07

As a user, I want skipping a task to not break my check-in streak so I do not feel punished for an honest "no."

**Acceptance:** Responding to all cards, even all skips, increments the streak. Only completely missing a check-in breaks the streak.

#### US-08

As a user, I want my "3x per week" task to stop appearing in check-in once I have done it 3 times that week so I am not nagged unnecessarily.

**Acceptance:** After 3 completions in a 7-day window starting Monday, the card is suppressed for the remainder of that week.

#### US-09

As a user, I want an overdue one-time task to be highlighted without breaking my streak so I am informed but not punished.

**Acceptance:** Overdue indicator shown; card remains available with options: Mark done / Extend deadline / Archive.

#### US-10

As a user, when I miss multiple check-in days, I want a non-shaming welcome-back screen so I restart without guilt.

**Acceptance:** Copy is "Welcome back", not "You failed"; offers `[Start fresh today]` or `[Quick catch-up]`; no angry notifications.

### Epic 3: Quests

#### US-11

As a user, I want to add a free-text progress update to a quest on a weekly prompt so I can document progress in my own words without rigid structure.

**Acceptance:** Prompt fires at the configured interval; text saved with timestamp; all updates shown chronologically.

#### US-12

As a user, I want to mark milestones complete for a quest so I can see tangible progress percentage.

**Acceptance:** Checking a milestone updates progress %; shown on both Quests page and Insights.

#### US-13

As a user, I want to see progress history and current completion estimate for a quest so I can understand momentum over time.

**Acceptance:** Quest detail shows timestamped updates and current progress indicator.

### Epic 4: Journal

#### US-14

As a user, I want to write free-form journal entries and optionally tag them to life categories so I can capture thoughts without forced structure.

**Acceptance:** Entry saves without required fields; optional multi-category tags; appears in timeline.

#### US-15

As a user, I want to search my journal entries by keyword so I can find past reflections.

**Acceptance:** Full-text search returns matching entries; results highlighted; sorted by date.

### Epic 5: Insights

#### US-16

As a user, I want to see a hexagon chart showing all 6 category health scores so I can instantly identify which life areas need attention.

**Acceptance:** Hexagon renders with correct color coding (green/yellow/red) based on calculated scores; tapping a vertex drills into that category.

#### US-17

As a user, I want my check-in streak displayed prominently with a calendar heatmap so I feel proud of consistently showing up.

**Acceptance:** Current streak number shown on Insights overview; calendar shows last 30+ days color-coded by check-in/miss.

#### US-18

As a user, I want an activity timeline showing all completions and journal entries in chronological order so I can see patterns over time.

**Acceptance:** Timeline ordered newest-first; filterable by category and task type; shows ✓ / ✗ / 📝 symbols.

### Epic 6: Gamification (Stage 2)

#### US-19

As a user, I want to earn XP and level up so that consistent tracking feels rewarding beyond just habit improvement.

**Acceptance:** XP bar always visible; level-up triggers animation; each level has a named tier; progression feels meaningful across the first 6 months of use.

#### US-20

As a user, I want streak freezes so that one missed day does not destroy weeks of progress.

**Acceptance:** Earn 1 freeze per 7 days (max hold 2); freeze auto-activates on missed day and is consumed; calendar shows ❄️ on freeze-used days.

#### US-21

As a user, I want all gamification features to be opt-out so I can use Odyssey as a calm tool if I prefer.

**Acceptance:** Settings page allows disabling XP, notifications, and leaderboards independently; disabling does not affect core tracking data.

### Epic 7: Sage AI (Stage 2)

#### US-22

As a user, I want Sage to reference my own journal entries when suggesting pattern insights so the advice feels personal rather than generic.

**Acceptance:** Sage responses cite specific journal text and dates; context source is transparent (user can see what was retrieved).

#### US-23

As a user, I want a weekly Sage check-in that surfaces one pattern and asks one question so I get proactive reflection without being overwhelmed.

**Acceptance:** Fires once per week (Sunday evening); maximum 3 paragraphs plus 1 question; user can dismiss without responding.

#### US-24

As a user, I want Sage to be completely opt-in and deletable so my intimate data does not feel surveilled.

**Acceptance:** Sage tab disabled by default; enabling requires explicit opt-in; all Sage conversation history can be deleted; embeddings purged on request.

## 9. Good-to-Have Features

Features that are not essential for the MVP launch but would meaningfully improve the product. These should be considered for inclusion in later Stage 1 phases or early Stage 2 based on user feedback and development capacity.

### 9.1 Seasons / Life Modes

Users can self-declare (or the system can eventually detect) which mode they are in. The app adapts its expectations, language, and visible tasks accordingly.

- **Growth Mode**: High energy, ready to push. System encourages stretch goals, suggests new challenges.
- **Maintenance Mode**: Holding steady. System focuses on core habits only, celebrates stability. "Keeping essentials going IS progress."
- **Survival Mode**: Low energy, high stress, burnout. System strips to absolute minimums (Tier 1 only), removes non-critical tracking, offers support. "Just the basics today. That's enough."

MVP implementation: manual toggle in settings ("How's life right now?" selector). Future: auto-detection from check-in patterns, sleep data, journal sentiment.

This shapes UX language throughout: "Welcome back" not "You missed 3 days." "Interesting pattern" not "You failed again."

#### US-25

As a user, I want to declare my current life mode (Growth / Maintenance / Survival) so that Odyssey adjusts its expectations and only shows me what matters right now.

**Acceptance:** Selecting Survival Mode hides non-essential tasks and changes app language to supportive tone. Maintenance Mode suppresses stretch goals. Growth Mode surfaces challenges and suggestions.

### 9.2 Habit Tier / Priority System

Not all habits are equal. The tier system defines what to keep when life gets hard.

- **Tier 1: Non-Negotiables** (5-7 max): Identity-defining habits. These happen in every mode, including Survival. Examples: sleep 7+ hours, meditate 10 min, one workout.
- **Tier 2: Weekly Rituals** (3-5): Batched activities with flexible timing. Examples: Sunday meal prep, Wednesday social, Friday wind-down.
- **Tier 3: Monthly Focuses** (1-2 themes): Rotate deep attention across categories. Pick one area for a 30-day deep dive.
- **Tier 4: Quarterly Experiments** (1-3): Big swings, high-risk/high-reward. Can fail spectacularly; that's the point.

When a user enters Survival Mode, only Tier 1 shows in check-in. Maintenance Mode shows Tier 1 + 2. Growth Mode shows everything.

#### US-26

As a user, I want to assign a priority tier to each recurring task so that when life gets hard, Odyssey automatically shows only my non-negotiable habits.

**Acceptance:** Task creation form includes optional tier selector (1-4). Tier interacts with life mode: Survival Mode filters check-in to Tier 1 only.

### 9.3 Structured Review Rituals

Guided reflection prompts at regular cadences beyond the daily check-in.

#### Weekly Review (Sunday, 15 min)

- Prompted once per week with guided questions:
  - "What felt good this week?"
  - "What was hard?"
  - "What did I learn about myself?"
  - "What matters most next week?"
- Auto-generated summary: completion rates per category, mood/energy trends
- Saved as a special journal entry type, searchable

#### Monthly Review (Last Sunday of month, 30 min)

- Rate each of the 6 categories subjectively (1-10)
- Review wins and struggles
- Pick next month's focus area (1-2 categories)
- Sets the "Monthly Focus" visible on Insights
- Optional: Joy Audit prompt ("Which habits make me feel alive? Which feel like homework?")

#### Quarterly Overhaul (Every 3 months, 60 min)

- Deep audit: what's working, what's not, what's missing
- Redesign tiers if needed
- Plan next quarter's experiments
- Review wins archive and celebrate progress

#### US-27

As a user, I want a guided weekly review prompt every Sunday that asks me structured reflection questions so I can notice patterns without building my own reflection habit.

**Acceptance:** Prompt appears once per week; includes auto-generated stats (completion rates, category trends); saves as a searchable journal entry.

#### US-28

As a user, I want a monthly review where I subjectively rate all 6 life categories and pick next month's focus area so I can course-correct intentionally.

**Acceptance:** Monthly prompt shows each category with a 1-10 slider; selected focus area appears on Insights for the following month; ratings feed into category health scores.

### 9.4 Energy / Mood Quick Ratings

Beyond task yes/no, capture how the user *feels* each day with minimal friction.

- At the end of daily check-in, optional quick ratings:
  - Energy level (1-5 or emoji scale)
  - Mood (emoji: frustrated / meh / okay / good / great)
  - Optional one-line note
- Data feeds into Insights trends and future pattern recognition
- Takes 5-10 extra seconds, always skippable

#### US-29

As a user, I want to rate my energy and mood at the end of each check-in so I can track how I feel over time, not just what I did.

**Acceptance:** After the last task card, an optional card appears with energy slider and mood emoji picker. Skippable. Data visible in Insights trends.

### 9.5 "Today's Win" Positive Framing

Every check-in completion screen includes a prompt for one positive thing, no matter how small.

- After completing all cards: "What's one win from today? (even tiny)"
- Free-text field, optional but encouraged
- Forces positive reframing even on bad days
- Saved and visible in activity timeline and weekly review

#### US-30

As a user, I want to capture "Today's Win" after each check-in so I build a habit of noticing what went well.

**Acceptance:** Completion screen shows optional "Today's Win" text field. Wins are saved, searchable, and surfaced in weekly review summaries.

### 9.6 Progressive Onboarding

Instead of exposing all features at once, gradually introduce complexity as the user builds the daily habit.

- **Week 1**: Start with max 3 habits. Only check-in page visible. Journal, Quests, and Insights are locked/hidden.
- **After 7 days**: Unlock Insights and hexagon. Prompt: "You've been at this for a week! Here's how your categories look."
- **After 14 days**: Unlock Quests page. Suggest first quest.
- **After 21 days**: Unlock Journal. Suggest first reflection.
- **After 30 days**: Full app available. Prompt first monthly review.

Users can skip ahead and unlock everything immediately via settings.

#### US-31

As a user, I want Odyssey to gradually unlock features over my first month so I am not overwhelmed on day one.

**Acceptance:** New users see only check-in and task creation initially. Insights unlock after 7 check-ins. Quests after 14. Journal after 21. User can override via settings to unlock all immediately.

### 9.7 Joy Audit

Monthly self-check to prevent the system from becoming another source of obligation.

- Prompted during monthly review: "Let's check if your habits still serve you."
- For each active recurring task, asks: "Does this make you feel alive, or does it feel like homework?"
- Tasks marked "homework" for 2+ months get flagged with a suggestion: "Consider redesigning or dropping this."
- Permission-giving language: "Not everything needs to be forever. If yoga sucks after 3 months, try kickboxing."

#### US-32

As a user, I want a monthly Joy Audit that asks whether each habit still serves me so I can drop or redesign tasks that feel like obligations.

**Acceptance:** During monthly review, each active recurring task shows "Feels alive" / "Feels like homework" toggle. Tasks marked homework 2+ consecutive months get a visible flag suggesting redesign or removal.

### 9.8 Experiment-to-Habit Graduation

When a behavior experiment succeeds, offer to convert it into a recurring habit.

- On experiment completion (end date reached), prompt: "This experiment is done! How did it go?"
- If user marks it successful: "Want to make this a recurring habit?" with pre-filled task creation form
- Experiment learnings saved as a journal entry automatically

#### US-33

As a user, when a behavior experiment ends successfully, I want Odyssey to offer converting it into a recurring habit so the transition is seamless.

**Acceptance:** On experiment end date, completion prompt appears. If marked successful, a pre-filled recurring task creation form is offered. Experiment notes are auto-saved as a journal entry.

### 9.9 End-of-Week Summary

Automatic summary shown on the first check-in after a week completes.

- Shows: completion rates per category, streak status, categories needing attention
- Lightweight (not a full review): "Your week in numbers" card before check-in starts
- Dismissible; not blocking

#### US-34

As a user, I want to see an automatic weekly summary card showing my completion rates and category trends so I stay aware of patterns without extra effort.

**Acceptance:** On first check-in of a new week, a summary card appears before task cards. Shows per-category completion %, streak count, and one "needs attention" callout. Dismissible.

### 9.10 Anti-Tracking Guardrails

Built-in safeguards to prevent the system from becoming toxic.

- If a user checks in but marks all tasks as skipped for 5+ consecutive days, show a gentle prompt: "Looks like things are tough right now. Want to simplify your tasks or switch to Survival Mode?"
- If check-in time exceeds 3 minutes consistently, suggest removing tasks
- If journal entries show repeated negative language (future, with Sage), offer support resources
- Settings option: "Pause all tracking" that freezes streak without guilt messaging
- Warning signs reference: "If tracking feels like homework for 3 days straight, simplify or pause."

#### US-35

As a user, I want Odyssey to notice when tracking feels burdensome and suggest simplification so the app never becomes another source of stress.

**Acceptance:** After 5 consecutive days of all-skip check-ins, a non-judgmental prompt suggests simplifying tasks or switching to Survival Mode. A "Pause tracking" option in settings freezes the streak without loss messaging.

### 9.11 Customizable Themes

Allow users to personalize the app's terminology and visual theme to feel like *their* space.

Potential theme packs inspired by brainstorming:

- **Nature/Growth**: Habits = "Rituals", Quests = "Cultivations", Categories = "Gardens"
- **Developer/Tech**: Habits = "Cron Jobs", Quests = "Sprints", Categories = "Modules"
- **RPG/Game**: Habits = "Dailies", Quests = "Quests", Categories = "Realms"
- **Space/Explorer**: Habits = "Protocols", Quests = "Missions", Categories = "Sectors"

MVP: single default theme. Good-to-have: 2-3 theme options that change terminology and color palette.

#### US-36

As a user, I want to choose a visual and terminology theme so the app feels personal and fun to use.

**Acceptance:** Settings page offers theme selection. Changing theme updates all terminology labels and color palette throughout the app. Default theme is always available.

### 9.12 Quick Catch-Up Flow

When a user returns after missing multiple days, offer a fast way to backfill.

- Show missed days as a compact list: "You missed 3 days. Want to quickly log them?"
- For each missed day: show that day's tasks with bulk yes/no
- Completed in under 60 seconds for up to 7 missed days
- Alternative: "Start fresh today" skips catch-up entirely

#### US-37

As a user, when I return after missing days, I want a quick catch-up flow that lets me backfill in under 60 seconds so my data stays accurate without tedious re-entry.

**Acceptance:** After 2+ missed days, a catch-up screen shows each missed day's tasks in a compact checklist. Bulk "skip all" option available. "Start fresh" skips catch-up entirely.

### 9.13 Category Detail View

Tapping a category on the hexagon or Insights overview shows a dedicated detail page.

- All items in that category grouped by type (recurring, one-time, quests)
- Completion rates for the current period
- Historical score trend (line chart)
- Quick-add task to this category

#### US-38

As a user, I want to drill into a life category from the Insights overview to see all its tasks, scores, and trends in one place so I can understand and improve a specific area.

**Acceptance:** Tapping a category on the hexagon opens a detail view showing all tasks grouped by type, current completion rates, score history chart, and a quick-add task button.

## 10. Non-Goals (Explicitly Out of Scope)

*Note: Features listed in Section 9 (Good-to-Have) are candidates for inclusion; items below are explicitly excluded from all current planning.*

| Feature | Why Excluded |
| --- | --- |
| Native iOS/Android apps | Web-first (PWA) for Stage 1 |
| Swipe gestures | Using buttons for MVP simplicity |
| Social sharing / friend features | Stage 3 |
| App integrations (Calendar, Apple Health, Banking) | Stage 4 |
| Premium tier / monetization | Stage 4+ |
| Advanced ML correlation detection | Covered by Sage in Stage 2 |
| Guided meditations, CBT exercises | Future Sage expansion |

## 11. Technical Constraints

| Constraint | Requirement |
| --- | --- |
| Offline support | PWA with service worker; core check-in works offline |
| Load time | <2 second initial load |
| Check-in speed | 60-90 second P95 completion |
| Mobile browsers | Fully functional on mobile web |
| Privacy | No third-party analytics on user data |
| Data portability | Full export (JSON/CSV) always available |
| Auth | JWT, bcrypt passwords, protected routes |

Current stack: React 19 + TypeScript + Vite + Tailwind v4 (frontend), FastAPI + SQLAlchemy + PostgreSQL + Alembic (backend), Docker Compose.

## 12. Success Metrics

### Stage 1 Targets

| Metric | Target |
| --- | --- |
| Daily Active Users | >=60% of registered users |
| Avg daily check-in time | 60-90 seconds |
| 7-day retention | >50% |
| 30-day retention | >40% |
| 7+ day streak holders | >50% of active users |
| User-reported pattern discovery | 2+ patterns within first month |

### Stage 2 Targets

| Metric | Target |
| --- | --- |
| Gamification opt-out rate | <30% (majority find it valuable) |
| Sage weekly engagement | >40% of users chat weekly |
| 30-day retention lift vs Stage 1 | +10pp |
| NPS | >50 |

### Business (Year 2)

| Metric | Target |
| --- | --- |
| Total users | 100K |
| Paid conversion | 20% |
| MRR | ~$1M |
| GitHub stars | 500+ (open source) |

## 13. Current Implementation Status

| Phase | Feature | Status |
| --- | --- | --- |
| 1 | Auth (register, login, JWT, protected routes) | 🚧 In Progress |
| 2 | Task models + CRUD API | 🔜 Next |
| 2 | Task creation UI + suggestions | 🔜 Next |
| 3 | Daily check-in card interface | 🔜 Pending |
| 3 | Streak tracking | 🔜 Pending |
| 4 | Quests page + progress updates | 🔜 Pending |
| 4 | Journal with search | 🔜 Pending |
| 5 | Insights overview + activity timeline | 🔜 Pending |
| 5 | Category health scoring | 🔜 Pending |

## 14. Tagline

> "Three task types. Six life areas. 60 seconds daily."
