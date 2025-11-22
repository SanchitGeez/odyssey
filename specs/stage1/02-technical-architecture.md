# Odyssey - Technical Architecture (MVP)

## Architecture Overview

Odyssey MVP follows a simple client-side architecture with local data storage. The entire application runs in the browser as a Progressive Web App (PWA), requiring no backend infrastructure for the initial version. The core system revolves around three task types (Recurring Tasks, One-Time Tasks, and Projects), a card-based daily check-in interface optimized for 60-90 second completion, comprehensive activity tracking, and a dedicated Projects page for natural language updates on multi-step efforts and behavior experiments.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (lightweight, simple)
- **Routing**: React Router v6
- **Charts/Visualization**: Recharts
- **Date Handling**: date-fns
- **Icons**: React Icons

### Data Storage
- **Primary**: Browser LocalStorage
- **Backup**: JSON export/import functionality
- **Future**: IndexedDB for larger datasets

### Development & Deployment
- **Version Control**: Git/GitHub
- **Package Manager**: npm
- **Deployment**: Vercel (free tier)
- **PWA**: Vite PWA plugin

## Data Models

### Core Entities

#### 1. UserProfile
```typescript
interface UserProfile {
  id: string;
  createdAt: string;
  name?: string;
  checkInStreak: number;
  lastCheckInDate: string | null;
  settings: UserSettings;
}

interface UserSettings {
  theme: 'light' | 'dark';
  defaultProjectCheckInFrequency: 'weekly' | 'biweekly' | 'twice-weekly' | 'three-times-weekly';
  enableNotifications: boolean;
}
```

#### 2. Category
```typescript
type CategoryType = 'body' | 'mind' | 'work' | 'wealth' | 'connection' | 'meaning';

interface Category {
  type: CategoryType;
  name: string;
  description: string;
  currentScore: number; // 1-10, auto-calculated
  lastUpdated: string;
}

const CATEGORIES = {
  body: { name: 'Body & Vitality', icon: '💪' },
  mind: { name: 'Mind & Inner World', icon: '🧠' },
  work: { name: 'Work & Mastery', icon: '💼' },
  wealth: { name: 'Wealth & Resources', icon: '💰' },
  connection: { name: 'Connection & Belonging', icon: '❤️' },
  meaning: { name: 'Meaning & Transcendence', icon: '🌟' }
};
```

#### 3. Task (Base Interface)
```typescript
type TaskType = 'recurring' | 'one-time' | 'project';

interface BaseTask {
  id: string;
  name: string;
  type: TaskType;
  category: CategoryType;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isArchived: boolean;
}
```

#### 4. Recurring Task
```typescript
interface RecurringHabit extends BaseTask {
  type: 'recurring';
  frequency: {
    type: 'daily' | 'specific-days' | 'x-per-week' | 'weekly';
    // For 'specific-days': [1, 3, 5] = Mon, Wed, Fri (0=Sun, 6=Sat)
    daysOfWeek?: number[];
    // For 'x-per-week': 3 = 3 times per week
    timesPerWeek?: number;
  };
  requiresInput: boolean; // true if needs value (e.g., "track spending")
  inputType?: 'number' | 'text' | 'time' | 'duration';
  inputLabel?: string; // e.g., "Amount (₹)"
  inputUnit?: string; // e.g., "₹", "minutes"
}
```

#### 5. One-Time Task
```typescript
interface OneTimeTask extends BaseTask {
  type: 'one-time';
  dueDate: {
    type: 'specific' | 'this-week' | 'this-month' | 'flexible';
    date?: string; // ISO date if specific
    weekStart?: string; // ISO date if this-week
    monthStart?: string; // ISO date if this-month
  };
  completedAt?: string; // ISO timestamp when completed
}
```

#### 6. Project
```typescript
interface Project extends BaseTask {
  type: 'project';

  // Common fields for all projects
  startDate: string; // ISO date
  endDate?: string; // ISO date (optional, mainly for experiments)
  successCriteria: string; // What success looks like / Goal description
  checkInFrequency: 'weekly' | 'biweekly' | 'twice-weekly' | 'three-times-weekly';

  // Type indicator
  projectType: 'build' | 'experiment'; // Build/create project vs behavior experiment

  // Milestones (optional, mainly for build projects)
  milestones?: Milestone[];

  // Progress tracking
  progress: ProjectProgress[];
  overallProgress: number; // 0-100 percentage

  // For experiments: track consecutive days
  daysCompleted?: number; // Used for experiments like "30-day streak"
}

interface Milestone {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: string;
  order: number;
}

interface ProjectProgress {
  id: string;
  projectId: string;
  date: string; // ISO date
  entry: string; // Natural language progress update
  milestonesCompleted?: string[]; // milestone IDs (for build projects)
  sentiment?: 'positive' | 'neutral' | 'negative'; // Future: AI analysis
  createdAt: string;
}
```

#### 7. Daily Check-In
```typescript
interface DailyCheckIn {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  completed: boolean; // true if user responded to all cards
  completedAt?: string; // ISO timestamp when completed
  cardResponses: CardResponse[];
  createdAt: string;
}

interface CardResponse {
  id: string;
  taskId: string;
  taskType: TaskType;
  taskName: string;
  category: CategoryType;
  response: {
    type: 'yes-no' | 'input' | 'skipped';
    value?: boolean | string | number; // true/false for yes-no, value for input
  };
  timestamp: string; // ISO timestamp when responded
}
```

#### 8. Check-In Streak
```typescript
interface StreakData {
  currentStreak: number; // consecutive days of completed check-ins
  longestStreak: number; // all-time longest
  totalCheckIns: number; // total number of completed check-ins
  lastCheckInDate: string | null; // ISO date
  checkInHistory: CheckInHistoryEntry[];
}

interface CheckInHistoryEntry {
  date: string; // ISO date
  completed: boolean;
  cardsTotal: number;
  cardsResponded: number;
}
```

#### 9. Journal Entry
```typescript
interface JournalEntry {
  id: string;
  date: string; // ISO date
  content: string; // Free-form text
  tags?: CategoryType[]; // Optional category tags
  createdAt: string;
  updatedAt: string;
}
```

#### 10. Activity Record (Timeline)
```typescript
interface ActivityRecord {
  id: string;
  type: 'task-completed' | 'task-skipped' | 'project-progress' | 'journal-entry';
  date: string; // ISO date
  timestamp: string; // ISO timestamp
  taskId?: string;
  taskName?: string;
  taskType?: TaskType;
  category?: CategoryType;
  details: {
    // For task completions
    completed?: boolean;
    inputValue?: string | number;
    // For projects
    progressEntry?: string;
    projectType?: 'build' | 'experiment';
    // For journal
    preview?: string; // First 100 chars
  };
}
```

#### 11. Task Suggestions
```typescript
interface TaskSuggestion {
  id: string;
  name: string;
  type: TaskType;
  category: CategoryType;
  description?: string;
  suggestedFrequency?: RecurringHabit['frequency'];
  suggestedDuration?: number; // For experiments, in days
}

// Pre-populated suggestions array
const TASK_SUGGESTIONS: TaskSuggestion[] = [
  // Body & Vitality
  { id: 'body-1', name: 'Sleep 7+ hours', type: 'recurring', category: 'body', suggestedFrequency: { type: 'daily' } },
  { id: 'body-2', name: 'Workout 30 min', type: 'recurring', category: 'body', suggestedFrequency: { type: 'x-per-week', timesPerWeek: 3 } },
  // ... more suggestions
];
```

## Application Structure

```
/src
├── /components
│   ├── /common
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── CategoryBadge.tsx
│   ├── /overview
│   │   ├── LifeHexagon.tsx
│   │   ├── CategoryCard.tsx
│   │   ├── StreakDisplay.tsx
│   │   ├── QuickStats.tsx
│   │   └── ActivityTimeline.tsx
│   ├── /checkin
│   │   ├── CheckInCard.tsx
│   │   ├── CardProgress.tsx
│   │   └── CompletionSummary.tsx
│   ├── /tasks
│   │   ├── TaskList.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskSuggestions.tsx
│   │   └── TaskCard.tsx
│   ├── /projects
│   │   ├── ProjectList.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── ProjectProgressForm.tsx
│   │   ├── MilestoneTracker.tsx
│   │   └── ProjectTimeline.tsx
│   └── /journal
│       ├── JournalEntry.tsx
│       ├── JournalList.tsx
│       └── JournalForm.tsx
├── /pages
│   ├── OverviewPage.tsx     # Dashboard with hexagon, streaks, analytics
│   ├── CheckInPage.tsx      # Card-based daily task completion (60-90 sec)
│   ├── ProjectsPage.tsx     # Natural language updates, milestone tracking
│   └── JournalPage.tsx      # Free-form notes and reflections
├── /lib
│   ├── /storage
│   │   ├── localStorage.ts
│   │   ├── exportImport.ts
│   │   └── migrations.ts
│   ├── /store
│   │   ├── useCheckInStore.ts
│   │   ├── useTaskStore.ts
│   │   ├── useProjectStore.ts
│   │   ├── useJournalStore.ts
│   │   └── useSettingsStore.ts
│   ├── /utils
│   │   ├── dateHelpers.ts
│   │   ├── calculations.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   └── /types
│       └── index.ts
├── /assets
│   ├── /icons
│   └── /images
├── App.tsx
└── main.tsx
```

## Key Technical Decisions

### 1. Why Local Storage?
**Pros:**
- No backend needed (faster MVP)
- Complete user privacy
- Works offline by default
- No hosting costs
- Simple implementation

**Cons:**
- Data limited to single device
- Risk of data loss if browser storage cleared
- No sync across devices

**Mitigation:**
- Provide easy export/import (JSON)
- Clear warnings about data storage
- Future: Add optional cloud sync

### 2. Why Zustand over Redux?
- Simpler API (less boilerplate)
- Smaller bundle size
- Good TypeScript support
- Sufficient for MVP scope
- Easy migration path to alternatives

### 3. Why Vite over Create React App?
- Faster dev server (HMR)
- Better build performance
- Modern tooling
- Smaller bundle sizes
- Better defaults

### 4. PWA Approach
- Installable on mobile/desktop
- Offline functionality
- App-like experience
- No app store submission needed for MVP

## State Management Strategy

### Global Stores (Zustand)

#### CheckInStore
```typescript
interface CheckInStore {
  checkIns: DailyCheckIn[];
  streak: StreakData;
  addCheckIn: (checkIn: Omit<DailyCheckIn, 'id'>) => void;
  updateCheckIn: (id: string, updates: Partial<DailyCheckIn>) => void;
  getTodayCheckIn: () => DailyCheckIn | undefined;
  getCheckInByDate: (date: string) => DailyCheckIn | undefined;
  getCheckInsInRange: (start: string, end: string) => DailyCheckIn[];
  updateStreak: () => void;
}
```

#### TaskStore
```typescript
interface TaskStore {
  recurringTasks: RecurringHabit[];
  oneTimeTasks: OneTimeTask[];
  addRecurringTask: (task: Omit<RecurringHabit, 'id'>) => void;
  addOneTimeTask: (task: Omit<OneTimeTask, 'id'>) => void;
  updateTask: (id: string, updates: Partial<BaseTask>) => void;
  deleteTask: (id: string) => void;
  getActiveTasks: () => (RecurringHabit | OneTimeTask)[];
  getTasksByCategory: (category: CategoryType) => (RecurringHabit | OneTimeTask)[];
  archiveTask: (id: string) => void;
}
```

#### ProjectStore
```typescript
interface ProjectStore {
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addProjectProgress: (projectId: string, entry: string, milestonesCompleted?: string[]) => void;
  getActiveProjects: () => Project[];
  getProjectsByCategory: (category: CategoryType) => Project[];
  updateOverallProgress: (projectId: string, progress: number) => void;
}
```

#### JournalStore
```typescript
interface JournalStore {
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntriesByDate: (date: string) => JournalEntry[];
  getEntriesByCategory: (category: CategoryType) => JournalEntry[];
  searchEntries: (query: string) => JournalEntry[];
}
```

## Data Persistence Layer

### LocalStorage Manager
```typescript
class StorageManager {
  private static readonly KEYS = {
    CHECK_INS: 'odyssey_checkins',
    RECURRING_TASKS: 'odyssey_recurring_tasks',
    ONE_TIME_TASKS: 'odyssey_onetime_tasks',
    PROJECTS: 'odyssey_projects',
    JOURNALS: 'odyssey_journals',
    STREAK: 'odyssey_streak',
    SETTINGS: 'odyssey_settings',
    VERSION: 'odyssey_version'
  };

  static save<T>(key: string, data: T): void;
  static load<T>(key: string): T | null;
  static clear(key: string): void;
  static export(): string; // JSON export
  static import(jsonData: string): boolean; // JSON import
}
```

### Data Export Format
```json
{
  "version": "1.0.0",
  "exportDate": "2025-11-22T10:30:00Z",
  "data": {
    "checkIns": [...],
    "recurringTasks": [...],
    "oneTimeTasks": [...],
    "projects": [...],
    "journals": [...],
    "streak": {...},
    "settings": {...}
  }
}
```

## Calculations & Key Algorithms

### 1. Daily Check-In Card Generation
```typescript
function generateDailyCheckInCards(date: string): CheckInCard[] {
  const cards: CheckInCard[] = [];
  const dayOfWeek = new Date(date).getDay(); // 0=Sun, 6=Sat

  // 1. Get recurring habits due today
  const recurringHabits = getActiveRecurringHabits();
  recurringHabits.forEach(habit => {
    if (isHabitDueToday(habit, date, dayOfWeek)) {
      cards.push(createCardFromHabit(habit));
    }
  });

  // 2. Get one-time tasks in valid period
  const oneTimeTasks = getActiveOneTimeTasks();
  oneTimeTasks.forEach(task => {
    if (isTaskVisibleToday(task, date)) {
      cards.push(createCardFromTask(task));
    }
  });

  // Note: Projects don't show in daily check-in
  // They have separate Projects page with weekly/bi-weekly prompts

  return cards.sort((a, b) => {
    // Sort by category for better UX
    return a.category.localeCompare(b.category);
  });
}

function isHabitDueToday(habit: RecurringHabit, date: string, dayOfWeek: number): boolean {
  switch (habit.frequency.type) {
    case 'daily':
      return true;
    case 'specific-days':
      return habit.frequency.daysOfWeek?.includes(dayOfWeek) ?? false;
    case 'x-per-week':
      // Check if target not yet met this week
      const weekCompletions = getCompletionsThisWeek(habit.id, date);
      return weekCompletions < (habit.frequency.timesPerWeek ?? 0);
    case 'weekly':
      // Once per week, show daily until completed
      const completedThisWeek = hasCompletedThisWeek(habit.id, date);
      return !completedThisWeek;
    default:
      return false;
  }
}

function isTaskVisibleToday(task: OneTimeTask, date: string): boolean {
  const today = new Date(date);

  switch (task.dueDate.type) {
    case 'specific':
      // Show on due date and after (if not completed)
      return today >= new Date(task.dueDate.date!);
    case 'this-week':
      // Show every day during the week
      const weekStart = new Date(task.dueDate.weekStart!);
      const weekEnd = addDays(weekStart, 7);
      return today >= weekStart && today < weekEnd;
    case 'this-month':
      // Show every day during the month
      const monthStart = new Date(task.dueDate.monthStart!);
      const monthEnd = addMonths(monthStart, 1);
      return today >= monthStart && today < monthEnd;
    case 'flexible':
      // Always visible
      return true;
    default:
      return false;
  }
}
```

### 2. Streak Calculation (Global Check-In)
```typescript
function calculateCheckInStreak(userId: string): StreakData {
  const history = getCheckInHistory(userId);
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Sort by date descending
  const sortedHistory = history.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate current streak (working backwards from today)
  const today = formatDate(new Date());
  let checkDate = today;

  for (const entry of sortedHistory) {
    if (entry.date === checkDate && entry.completed) {
      currentStreak++;
      checkDate = subtractDays(checkDate, 1);
    } else if (entry.date === checkDate && !entry.completed) {
      // Found incomplete day, streak broken
      break;
    } else if (entry.date < checkDate) {
      // Gap found, streak broken
      break;
    }
  }

  // Calculate longest streak (all time)
  for (const entry of sortedHistory) {
    if (entry.completed) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalCheckIns: history.filter(h => h.completed).length,
    lastCheckInDate: sortedHistory[0]?.date ?? null,
    checkInHistory: history
  };
}

// Check-in is complete when user responds to ALL cards
function isCheckInComplete(checkIn: DailyCheckIn, totalCards: number): boolean {
  return checkIn.cardResponses.length === totalCards;
}

// Streak doesn't break if user skips tasks, only if they don't check in
function shouldMaintainStreak(cardResponses: CardResponse[]): boolean {
  // As long as user responded to all cards (even with "skip"), streak continues
  return cardResponses.every(response => response.response.type !== undefined);
}
```

### 3. Category Health Score Calculation
```typescript
function calculateCategoryScore(
  category: CategoryType,
  timeRange: { start: string; end: string } = getLast30Days()
): number {
  const tasksInCategory = getAllTasksByCategory(category);

  if (tasksInCategory.length === 0) return 5; // Default neutral score

  let totalScore = 0;
  let weights = 0;

  // 1. Recurring habits completion (40% weight)
  const habits = tasksInCategory.filter(t => t.type === 'recurring') as RecurringHabit[];
  if (habits.length > 0) {
    const habitScore = calculateHabitCompletionRate(habits, timeRange);
    totalScore += habitScore * 0.4;
    weights += 0.4;
  }

  // 2. One-time tasks completion (20% weight)
  const oneTimeTasks = tasksInCategory.filter(t => t.type === 'one-time') as OneTimeTask[];
  if (oneTimeTasks.length > 0) {
    const taskScore = calculateTaskCompletionRate(oneTimeTasks, timeRange);
    totalScore += taskScore * 0.2;
    weights += 0.2;
  }

  // 3. Project progress (40% weight)
  const projects = tasksInCategory.filter(t => t.type === 'project') as Project[];
  if (projects.length > 0) {
    const projScore = calculateProjectProgress(projects);
    totalScore += projScore * 0.4;
    weights += 0.4;
  }

  // Normalize to 1-10 scale
  const finalScore = weights > 0 ? (totalScore / weights) * 10 : 5;
  return Math.max(1, Math.min(10, finalScore));
}

function calculateHabitCompletionRate(habits: RecurringHabit[], timeRange: { start: string; end: string }): number {
  let totalExpected = 0;
  let totalCompleted = 0;

  habits.forEach(habit => {
    const expected = getExpectedCompletions(habit, timeRange);
    const actual = getActualCompletions(habit.id, timeRange);
    totalExpected += expected;
    totalCompleted += actual;
  });

  return totalExpected > 0 ? totalCompleted / totalExpected : 0;
}
```

### 4. Task Overdue Detection
```typescript
function isTaskOverdue(task: OneTimeTask, currentDate: string): boolean {
  const today = new Date(currentDate);

  switch (task.dueDate.type) {
    case 'specific':
      return today > new Date(task.dueDate.date!);
    case 'this-week':
      const weekEnd = addDays(new Date(task.dueDate.weekStart!), 7);
      return today >= weekEnd;
    case 'this-month':
      const monthEnd = addMonths(new Date(task.dueDate.monthStart!), 1);
      return today >= monthEnd;
    case 'flexible':
      return false; // Never overdue
    default:
      return false;
  }
}

// Only mark streak-breaking if task is actually overdue AND incomplete
function shouldAffectStreak(task: OneTimeTask, currentDate: string): boolean {
  return !task.completedAt && isTaskOverdue(task, currentDate);
}
```

### 5. Project Progress Prompt Scheduling
```typescript
function shouldShowProjectPrompt(project: Project, today: string): boolean {
  const lastCheckIn = project.progress[project.progress.length - 1];

  if (!lastCheckIn) return true; // First check-in

  const daysSinceLastCheckIn = daysBetween(lastCheckIn.date, today);

  switch (project.checkInFrequency) {
    case 'weekly':
      return daysSinceLastCheckIn >= 7;
    case 'biweekly':
      return daysSinceLastCheckIn >= 14;
    case 'twice-weekly':
      // Show on Tue & Fri
      return [2, 5].includes(new Date(today).getDay()) && daysSinceLastCheckIn >= 3;
    case 'three-times-weekly':
      // Show on Mon, Wed, Fri
      return [1, 3, 5].includes(new Date(today).getDay()) && daysSinceLastCheckIn >= 2;
    default:
      return false;
  }
}
```

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Code-split routes and heavy components
2. **Memoization**: Use React.memo for expensive components
3. **Virtual Scrolling**: For long lists (if needed)
4. **Debouncing**: For search/filter inputs
5. **Image Optimization**: Compress and lazy-load images
6. **Bundle Size**: Keep dependencies minimal (<500kb gzipped)

### Performance Targets
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Lighthouse Score**: >90

## Security & Privacy

### Data Security
- All data stored locally in browser
- No external API calls for MVP
- No analytics or tracking
- Clear data deletion option
- Export allows user-controlled backups

### Input Validation
- Sanitize all user inputs
- Validate data types before storage
- Handle edge cases gracefully
- Prevent XSS through React's built-in protection

## Error Handling

### Strategy
```typescript
class ErrorHandler {
  static handle(error: Error, context: string): void {
    // Log to console in dev
    console.error(`Error in ${context}:`, error);

    // Show user-friendly message
    toast.error('Something went wrong. Your data is safe.');

    // Attempt recovery
    this.recoverFromError(error, context);
  }

  private static recoverFromError(error: Error, context: string): void {
    // Try to restore from localStorage
    // Fall back to empty state if corrupted
  }
}
```

## Testing Strategy

### Unit Tests
- Utils and calculation functions
- Data validation logic
- Storage manager

### Integration Tests
- Store operations
- Complete user flows
- Data persistence

### E2E Tests
- Critical paths only
- Daily check-in flow
- Habit creation and tracking
- Export/import functionality

### Tools
- **Unit/Integration**: Vitest
- **E2E**: Playwright
- **Coverage Target**: >70% for business logic

## Deployment

### Build Process
```bash
# Production build
npm run build

# Generates optimized static files in /dist
# Includes PWA manifest and service worker
```

### Hosting (Vercel)
- Automatic deployments from main branch
- Preview deployments for PRs
- Environment variables (if needed for future)
- Custom domain support

### CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Install dependencies
      - Run tests
      - Build for production
      - Deploy to Vercel
```

## Future Technical Considerations

### Scalability Path
1. **Cloud Sync** (Month 3-4)
   - Optional user accounts
   - FastAPI backend
   - PostgreSQL database
   - Authentication (JWT)

2. **Mobile Apps** (Month 6+)
   - React Native
   - Shared business logic
   - Native features (notifications)

3. **Advanced Analytics** (Month 9+)
   - Pattern recognition
   - Correlation analysis
   - Predictive insights

### Tech Debt to Monitor
- LocalStorage size limits (5-10MB)
- Performance with large datasets (>1 year of data)
- Browser compatibility issues
- PWA limitations on iOS

## Development Workflow

### Setup
```bash
# Clone repo
git clone https://github.com/user/odyssey.git
cd odyssey/client

# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

### Development Commands
```bash
npm run dev          # Dev server with HMR
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:coverage # Test coverage report
npm run lint         # ESLint
npm run format       # Prettier
```

## Conclusion

This architecture prioritizes:
- **Simplicity**: Minimal dependencies, straightforward data flow
- **Privacy**: Local-first, user-controlled data
- **Performance**: Fast load times, responsive UI
- **Maintainability**: Clear structure, typed code
- **Scalability**: Easy path to add backend when needed

The MVP focuses on core functionality with a solid foundation for future enhancements.
