import type { LifeDimension } from '../app/types'

export const DIMENSION_KEYS: LifeDimension[] = ['vitality', 'psyche', 'prowess', 'wealth', 'alliance', 'legacy']

export const DIMENSIONS: Record<
  LifeDimension,
  {
    label: string
    description: string
    entails: string
    cssVar: string
    shortLabel: string
    philosophy: string
    exampleRecurring: string[]
    exampleOneTime: string[]
    exampleQuests: string[]
  }
> = {
  vitality: {
    label: 'Vitality',
    shortLabel: 'Vitality',
    description: 'Physical health, sleep, nutrition, fitness, environment',
    entails: 'Vitality covers your energy system: sleep quality, movement, nutrition, recovery, and your physical environment. It is not only exercise; it is how prepared your body is to sustain focus, stress, and meaningful work over long periods.',
    cssVar: '--cat-body',
    philosophy: 'Your body is the vessel. Without vitality, nothing else can flourish.',
    exampleRecurring: [
      'Morning workout (30 min)',
      'Sleep by 11pm',
      'Drink 3L water',
      'Walk 8000 steps',
      'No screens after 10pm',
      'Meal prep Sunday',
      'Stretch/yoga 15 min',
    ],
    exampleOneTime: [
      'Get blood work done',
      'Buy a standing desk',
      'Schedule dentist appointment',
      'Set up sleep tracking',
    ],
    exampleQuests: [
      'Run a 5K under 30 minutes',
      'Lose 5kg in 3 months',
      'Complete a 30-day yoga challenge',
    ],
  },
  psyche: {
    label: 'Psyche',
    shortLabel: 'Psyche',
    description: 'Mental health, self-awareness, learning',
    entails: 'Psyche includes emotional regulation, attention, clarity, and internal narrative. It also includes how you process stress, learn from experience, and build mental models that improve decision-making.',
    cssVar: '--cat-mind',
    philosophy: 'Clarity of mind governs the quality of every decision you make.',
    exampleRecurring: [
      'Meditate 10 minutes',
      'Read 20 pages',
      'Journal one reflection',
      'No phone for first 30 minutes after waking',
      'Practice focused deep work block',
    ],
    exampleOneTime: [
      'Book therapy consultation',
      'Create a stress reset checklist',
      'Declutter workspace',
      'Set up a distraction blocker',
    ],
    exampleQuests: [
      'Finish one psychology book this month',
      'Build a 60-day meditation streak',
      'Complete a note-taking system setup',
    ],
  },
  prowess: {
    label: 'Prowess',
    shortLabel: 'Prowess',
    description: 'Career, skills, productivity, purpose',
    entails: 'Prowess is your craft and contribution: the systems, habits, and deliberate practice that convert effort into results. It includes career trajectory, execution quality, and skill compounding.',
    cssVar: '--cat-work',
    philosophy: 'Mastery compounds when you show up consistently with intent.',
    exampleRecurring: [
      'Top 3 priorities before noon',
      'Deep work 90 minutes',
      'Daily coding/problem-solving practice',
      'Review weekly goals',
      'End-of-day shutdown ritual',
    ],
    exampleOneTime: [
      'Update resume',
      'Create portfolio project page',
      'Apply to 3 target roles',
      'Define quarterly career roadmap',
    ],
    exampleQuests: [
      'Ship MVP for side project',
      'Get promoted within 6 months',
      'Complete advanced certification',
    ],
  },
  wealth: {
    label: 'Wealth',
    shortLabel: 'Wealth',
    description: 'Money, saving, investing, financial literacy',
    entails: 'Wealth covers financial resilience and optionality: budgeting, cashflow discipline, debt management, emergency buffers, and long-term investing behavior. The goal is stable freedom, not short-term optimization.',
    cssVar: '--cat-wealth',
    philosophy: 'Wealth is freedom of choice, built through disciplined stewardship.',
    exampleRecurring: [
      'Track daily spending',
      'No-spend day',
      'Review account balances',
      'Log every purchase over threshold',
      'Read one finance article',
    ],
    exampleOneTime: [
      'Create monthly budget template',
      'Open investment account',
      'Automate emergency fund transfer',
      'Review insurance coverage',
    ],
    exampleQuests: [
      'Build 6-month emergency fund',
      'Pay off high-interest debt',
      'Reach first 100k portfolio value',
    ],
  },
  alliance: {
    label: 'Alliance',
    shortLabel: 'Alliance',
    description: 'Family, friendships, relationships',
    entails: 'Alliance focuses on the health of your close relationships and social support systems. It includes trust, communication quality, conflict repair, and consistency of presence with people who matter.',
    cssVar: '--cat-connection',
    philosophy: 'Strong relationships are the multipliers of resilience and joy.',
    exampleRecurring: [
      'Reach out to one friend',
      'No-phone dinner with family',
      'Express one gratitude message',
      'Weekly date planning',
      'Call parents',
    ],
    exampleOneTime: [
      'Plan a family outing',
      'Organize friend meetup',
      'Write a heartfelt thank-you letter',
      'Set relationship check-in routine',
    ],
    exampleQuests: [
      'Host monthly gathering for 3 months',
      'Repair and rebuild one strained relationship',
      'Build a trusted circle of 5 peers',
    ],
  },
  legacy: {
    label: 'Legacy',
    shortLabel: 'Legacy',
    description: 'Values, purpose, creativity, legacy',
    entails: 'Legacy is about alignment with values and long-horizon meaning. It includes spiritual reflection, creative expression, personal philosophy, and the impact you want your life to leave behind.',
    cssVar: '--cat-meaning',
    philosophy: 'Legacy is what remains of your intent when time has passed.',
    exampleRecurring: [
      'Write 300 words',
      'Reflect on core values',
      'Create something daily',
      'Study one philosophical idea',
      'Practice gratitude prayer',
    ],
    exampleOneTime: [
      'Draft personal mission statement',
      'Record life lessons for future self',
      'Set yearly theme',
      'Create a giving plan',
    ],
    exampleQuests: [
      'Publish a long-form essay series',
      'Complete a creative body of work',
      'Launch a community impact initiative',
    ],
  },
}
