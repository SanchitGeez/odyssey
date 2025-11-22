# Odyssey - MVP Product Description

## Overview

Odyssey is a holistic life management application that helps users build awareness and maintain balance across six core dimensions of life through flexible task tracking. Unlike traditional habit trackers that focus on rigid routines, Odyssey adapts to your life with three types of tasks and a separate journaling space, each serving different purposes in your personal growth journey.

## Core Problem

People struggle to maintain balance in their lives because:
- Existing tools are fragmented (15+ apps for different areas of life)
- Habit trackers are punitive (red X's, broken streaks, shame spirals)
- One-size-fits-all approach doesn't fit real life (not everything is a daily habit)
- Data is scattered with no holistic view
- Tracking feels like surveillance rather than self-discovery
- No flexibility for different types of commitments (daily habits vs monthly experiments vs one-time tasks)

## The Solution

Odyssey organizes life into six interconnected categories and provides four flexible task types that match how life actually works. Spend just 60-90 seconds daily checking in with tasks due today, and watch patterns emerge over time.

## The Six Life Categories

### 1. Body & Vitality
Physical health, energy, sleep, nutrition, fitness, and environment

### 2. Mind & Inner World
Mental health, self-awareness, emotional regulation, stress management, and learning

### 3. Work & Mastery
Career growth, skills development, productivity, and purposeful contribution

### 4. Wealth & Resources
Money management, saving, investing, and resource optimization

### 5. Connection & Belonging
Relationships with family, friends, romantic partners, and community

### 6. Meaning & Transcendence
Values, purpose, spirituality, creative expression, and life vision

## The Three Task Types

### 1. 🔄 Recurring Tasks
**Purpose**: Build consistent patterns through repetition

**Examples**:
- Meditate 10 minutes (daily)
- Workout 30 minutes (Mondays, Wednesdays, Fridays)
- Call parents (twice a week)
- Budget review (every Sunday)

**Frequency Options**:
- Daily
- Specific days of week (e.g., Mon/Wed/Fri)
- X times per week (e.g., 3x per week)
- Weekly (once per week, any day)
- Custom patterns

**In Daily Check-In**:
- Shows up on designated days
- Simple yes/no completion
- Contributes to category health score

### 2. ✅ One-Time Tasks
**Purpose**: Complete specific actions that don't repeat

**Examples**:
- Book annual health checkup
- Buy new running shoes
- File taxes
- Set up investment account
- Call old friend to reconnect

**Timing Options**:
- Specific due date
- "Sometime this week"
- "Sometime this month"
- No deadline (but visible)

**In Daily Check-In**:
- Shows every day during valid period (e.g., all of November for "sometime this month")
- Doesn't affect streak until past due
- Archives automatically when completed

### 3. 🎯 Projects
**Purpose**: Multi-step efforts OR behavior experiments - anything that needs ongoing tracking outside daily check-in

**Two Types of Projects**:

**A. Build/Create Projects** - Multi-step efforts with milestones
- Build side project
- Learn Spanish
- Organize home
- Plan wedding

**B. Behavior Experiments** - Test new behaviors for a defined period
- 30-day morning gym trial
- No alcohol for November
- Meal prep for 4 weeks
- Cold showers for 21 days

**Structure**:
- Start date (and optional end date for experiments)
- Success criteria / Goal description
- Milestones (optional - mainly for build projects)
- Overall progress percentage
- Natural language progress updates

**Tracking**:
- NOT in daily check-in cards
- Separate Projects page with weekly or bi-weekly prompts
- "How's [project name] going?" or "Any progress?"
- Free-text response about progress
- Milestone completion tracking (if applicable)
- Visual timeline showing days/progress

## Application Structure (4 Main Pages)

### 1. Overview
- Dashboard with hexagon visualization
- Current streak display
- Active tasks and projects summary
- Category health scores
- Quick create/modify tasks
- Activity timeline
- Weekly/monthly insights

### 2. Check-In
- Card-based daily task completion
- 60-90 second interaction
- Only shows tasks due today
- Progress bar for completion
- Streak tracking

### 3. Projects
- All active projects (build + experiments)
- Progress tracking with natural language updates
- Milestone management
- Timeline visualization
- Weekly/bi-weekly prompts

### 4. Journal
- Free-form notes and reflections
- Optional category tagging
- Searchable
- Chronological view

## Core MVP Features

### 1. Task Management

**Create Tasks**:
- Choose task type (Recurring, One-Time, Project)
- Assign to life category
- Set frequency/timeline
- Get suggestions based on category (pre-populated common tasks)

**Smart Suggestions**:
When creating a task in "Body & Vitality", system suggests:
- "Join gym 3x/week" (Recurring)
- "Sleep 7+ hours" (Recurring)
- "Meal prep Sundays" (Recurring)
- "Annual health checkup" (One-Time)
- "30-day morning gym experiment" (Project)

### 2. Daily Check-In (60-90 seconds)

**Card-Based Interface**:
- Opens to show all tasks due today
- One card per task
- Swipe right (✓) or left (✗) for yes/no tasks - **MVP: Use buttons instead**
- Input field + buttons for tasks requiring data
- Progress bar shows cards remaining
- Complete all cards = check-in done = streak +1

**Example Flow**:
```
Card 1/5: Meditate 10 minutes
Category: Mind & Inner World
[Did it ✓] [Skipped ✗]

Card 2/5: Call parents
Category: Connection & Belonging
[Did it ✓] [Skipped ✗]

Card 3/5: Book health checkup (due Nov 30)
Category: Body & Vitality
[Done - Archive] [Skip for now]

Card 4/5: Track daily spending
Category: Wealth & Resources
Amount: [₹___]
[Save] [Skip]

Card 5/5:
Check-in complete! 5-day streak 🔥
[View Dashboard]
```

**Flexible Task Behavior**:
- "Sometime this month" tasks: Show every day in November, don't break streak until Dec 1
- "3x per week" tasks: Show daily until target met for week
- Overdue tasks: Highlighted but still tracked normally

### 3. Projects Page

**Dedicated Projects Tracking**:
- Separate page from daily check-in
- List all active projects (build projects + behavior experiments)
- Weekly or bi-weekly progress prompts
- Natural language input

**Example Prompt**:
- "How's your 30-day gym experiment going?"
- User response: "Going well! Went 6 out of 7 days this week. Mornings work better than evenings."

**Project Details**:
- Progress timeline
- Milestone tracking (for build projects)
- Days completed (for experiments)
- All progress updates in chronological order
- Success criteria visible

### 4. Journal & Notes

**Free-Form Capture**:
- Not a task type, just a writing space
- Quick notes, reflections, observations
- Optional tagging to categories
- Searchable
- Timestamped
- No structure required

**Use Cases**:
- Daily gratitude
- Weekly reflection
- Random thoughts
- Insights about patterns
- Emotional processing

### 5. Overview Dashboard

**Hexagon Visualization**:
- Shows health of all 6 categories
- Color-coded indicators (green/yellow/red)
- Click category to see tasks in that area
- Overall balance score

**Activity Timeline**:
- Chronological feed of all task completions
- Filter by category
- Filter by task type
- See patterns over time

**Streak Display**:
- Global check-in streak (days in a row responded to all cards)
- Prominent placement for motivation
- No punishment for breaking - just restart
- Visual calendar showing check-in history

### 6. Category Health Scoring

**Automatic Calculation**:
Based on tasks in each category:
- Recurring habit completion rate
- One-time task completion
- Experiment progress
- Project milestones hit
- Recent activity level

**Visual Feedback**:
- 🟢 Green (7-10): Thriving
- 🟡 Yellow (4-6): Maintaining
- 🔴 Red (1-3): Needs attention

### 7. Task Suggestions Library

**Pre-populated by Category**:

Body & Vitality:
- Sleep 7+ hours
- Workout 3x/week
- Meal prep Sundays
- 2L water daily
- Annual health checkup

Mind & Inner World:
- Meditate 10 min daily
- Journal 5 min
- Read 30 min
- Therapy session weekly
- Digital detox after 9 PM

Work & Mastery:
- Deep work block 2 hours
- Learn new skill 1 hour
- Side project 30 min
- Contribute to open source
- Mentor someone

Wealth & Resources:
- Track expenses daily
- Budget review weekly
- Set up SIP
- Emergency fund goal
- Read finance book monthly

Connection & Belonging:
- Call parents 2x/week
- 1-on-1 friend hangout
- Host dinner party
- Join local club
- Volunteer 4 hours/month

Meaning & Transcendence:
- Morning ritual
- Gratitude practice
- Weekend adventure
- Creative project time
- Values reflection monthly

## What Makes Odyssey Different

### Flexible Task Types
- Not just habits - one-time tasks, experiments, projects too
- Match how life actually works
- Different tracking for different commitment types

### Smart Frequency Options
- Beyond daily - "3x per week", "sometime this month", specific days
- System adapts display based on frequency
- Doesn't penalize until actually overdue

### 60-90 Second Daily Commitment
- Card-based interface optimized for speed
- Only see what's due today
- Simple interactions
- Global streak for showing up (not perfection)

### Non-Judgmental Tracking
- No red X's or shame spirals
- "Skip for now" is always an option
- Flexible tasks don't break streak until overdue
- Activity history = data, not judgment

### Holistic View
- Six categories ensure balance
- See which areas need attention
- Prevent tunnel vision on one dimension

### Smart Suggestions
- Curated task library per category
- Reduces decision fatigue
- Learn from common patterns
- Can always create custom

## User Experience Principles

1. **Speed First** - 60-90 seconds daily, not 5+ minutes
2. **Calm Technology** - Respects user's time and attention
3. **Data Minimalism** - Only track what serves you
4. **Human-Centered** - Designed for real humans with messy lives
5. **Joyful Interaction** - Delightful, not clinical
6. **Privacy First** - User owns all data, local storage

## Success Metrics

### Product
- Daily active usage of 60%+ of registered users
- Average daily check-in time: 60-90 seconds (efficiency goal)
- Streak retention: 50%+ users maintain 7+ day streaks
- 7-day retention: >50%
- 30-day retention: >40%

### User Impact
- Users can identify at least 2 personal patterns within first month
- Balanced category scores (no single category neglected for >2 weeks)
- Self-reported: "Odyssey helps me stay balanced" >70% agree
- Sustained usage (not abandoned after 2 weeks like most trackers)

## Not in MVP (Future Considerations)

- AI insights or recommendations (Stage 4)
- Social features or sharing (Stage 3)
- Integrations with other apps (Stage 3)
- Swiping gestures (using buttons for MVP)
- Mobile native apps (web-first, PWA)
- Premium features or monetization (Stage 4)
- Cloud sync or accounts (local-only for MVP)
- Advanced analytics or correlation detection

## Target User (MVP)

**Primary**: Tech-savvy 22-35 year olds who:
- Have tried multiple productivity/habit apps
- Feel overwhelmed by rigid habit systems
- Want to understand themselves better
- Struggle with one-size-fits-all approaches
- Value privacy and data ownership
- Comfortable with web applications
- Want balance, not just productivity

**Use Case**: Holistic life management with flexible task tracking for sustainable improvement

## MVP Timeline

**Goal**: Usable product in 6-8 weeks

**Week 1-2**:
- Core data models (3 task types, 6 categories)
- Task creation with suggestions
- Basic UI framework (4 pages)

**Week 3-4**:
- Daily check-in card interface
- Streak tracking
- Overview dashboard with hexagon

**Week 5-6**:
- Projects page (progress tracking, milestones)
- Journal/Notes page
- Category health scoring

**Week 7-8**:
- Activity timeline
- Polish and testing
- Data export

## Key Constraints

- Must work offline (PWA)
- Must be fast (<2 second load time)
- Daily check-in must complete in 60-90 seconds
- Must work on mobile browsers
- Must allow complete data export
- No user accounts required (local storage)
- Privacy-first (no analytics tracking user data)
- Simple UI (buttons, not complex gestures for MVP)

## Core Value Proposition

**"Life is messy. Your tracker shouldn't be."**

Odyssey adapts to how you actually live - with daily habits, one-time tasks, and projects - all organized across the six dimensions that matter. Track in 60 seconds, understand yourself over months.

**Secondary Tagline**: "Three task types. Six life areas. 60 seconds daily."
