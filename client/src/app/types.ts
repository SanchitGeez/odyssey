export type TaskType = 'one_time' | 'recurring'
export type TaskStatus = 'active' | 'completed' | 'archived'
export type TaskActivityType = 'done' | 'skipped' | 'value_logged' | 'status_changed' | 'deadline_extended' | 'note_added'
export type LifeDimension = 'vitality' | 'psyche' | 'prowess' | 'wealth' | 'alliance' | 'legacy'

export type QuestStatus = 'active' | 'paused' | 'completed' | 'archived'
export type QuestActivityType = 'progress_updated' | 'status_changed' | 'milestone_added' | 'milestone_completed' | 'note_added'

export type User = {
  id: string
  email: string
  timezone: string
}

export type AuthTokens = {
  access_token: string
  refresh_token: string
  token_type: string
}

export type Task = {
  id: string
  title: string
  description: string | null
  category: LifeDimension
  task_type: TaskType
  status: TaskStatus
  schedule_type: string | null
  schedule_config: Record<string, unknown> | null
  due_window_type: string | null
  due_date: string | null
  window_start: string | null
  window_end: string | null
}

export type DailyItem = {
  task_id: string
  title: string
  category: LifeDimension
  status: string
  response: string | null
}

export type DailyItemsResponse = {
  date: string
  total: number
  answered: number
  pending: number
  items: DailyItem[]
}

export type Quest = {
  id: string
  title: string
  description: string | null
  category: LifeDimension | null
  status: QuestStatus
  target_date: string | null
  success_criteria: string | null
  progress_percent: number | null
}

export type QuestActivity = {
  id?: string
  activity_type: QuestActivityType
  event_date: string
  payload: Record<string, unknown> | null
  created_at?: string
}

export type Journal = {
  id: string
  title: string | null
  content: string
  tags: string[] | null
  category_tags: LifeDimension[] | null
}

export type InsightsOverview = {
  window: {
    from_date: string
    to_date: string
  }
  current_streak: number
  tasks: {
    active: number
    done: number
    skipped: number
  }
  quests: {
    active: number
    updates: number
  }
  journals: {
    entries: number
  }
}
