/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getStoredTokens, setStoredTokens } from '../lib/storage'
import type {
  AuthTokens,
  DailyItemsResponse,
  InsightsOverview,
  Journal,
  LifeDimension,
  Quest,
  QuestActivity,
  QuestActivityType,
  QuestStatus,
  Task,
  TaskActivityType,
  TaskStatus,
  TaskType,
  User,
} from './types'

type ApiError = {
  status: number
  message: string
}

type TaskPayload = {
  title: string
  description?: string
  category: LifeDimension
  task_type: TaskType
  schedule_type?: string
  schedule_config?: Record<string, unknown>
  due_window_type?: string
  due_date?: string
  window_start?: string
  window_end?: string
}

type TaskPatch = Partial<TaskPayload> & { status?: TaskStatus }

type QuestPayload = {
  title: string
  description?: string
  category?: LifeDimension
  target_date?: string
  success_criteria?: string
}

type QuestPatch = Partial<QuestPayload> & { status?: QuestStatus; progress_percent?: number }

type JournalPayload = {
  title?: string
  content: string
  tags?: string[]
  category_tags?: LifeDimension[]
}

type JournalPatch = Partial<JournalPayload>

type AppApi = {
  login: (email: string, password: string) => Promise<User>
  register: (email: string, password: string, timezone: string) => Promise<User>
  logout: () => void
  me: () => Promise<User>
  listTasks: () => Promise<Task[]>
  createTask: (payload: TaskPayload) => Promise<Task>
  updateTask: (taskId: string, payload: TaskPatch) => Promise<Task>
  deleteTask: (taskId: string) => Promise<void>
  dailyItems: (day: string) => Promise<DailyItemsResponse>
  respondDaily: (taskId: string, response: TaskActivityType, day: string, payload?: Record<string, unknown>) => Promise<void>
  listQuests: () => Promise<Quest[]>
  createQuest: (payload: QuestPayload) => Promise<Quest>
  updateQuest: (questId: string, payload: QuestPatch) => Promise<Quest>
  deleteQuest: (questId: string) => Promise<void>
  listQuestActivity: (questId: string) => Promise<QuestActivity[]>
  addQuestActivity: (questId: string, activityType: QuestActivityType, eventDate: string, payload?: Record<string, unknown>) => Promise<void>
  listJournals: (search?: string) => Promise<Journal[]>
  getJournal: (journalId: string) => Promise<Journal>
  createJournal: (payload: JournalPayload) => Promise<Journal>
  updateJournal: (journalId: string, payload: JournalPatch) => Promise<Journal>
  deleteJournal: (journalId: string) => Promise<void>
  getInsightsOverview: (fromDate: string, toDate: string) => Promise<InsightsOverview>
}

type AuthContextValue = {
  loading: boolean
  isAuthenticated: boolean
  user: User | null
  tokens: AuthTokens | null
  api: AppApi
}

const AuthContext = createContext<AuthContextValue | null>(null)

function trimPayload<T extends Record<string, unknown>>(payload: T): T {
  const out = { ...payload }
  for (const key of Object.keys(out)) {
    const value = out[key]
    if (value === '' || value === undefined) {
      delete out[key]
    }
  }
  return out
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialTokens = getStoredTokens()
  const [tokens, setTokens] = useState<AuthTokens | null>(initialTokens)
  const tokensRef = useRef<AuthTokens | null>(initialTokens)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let message = `Request failed (${response.status})`
      try {
        const body = (await response.json()) as { detail?: string; message?: string }
        message = body.detail || body.message || message
      } catch {
        // ignore non-json errors
      }
      throw { status: response.status, message } satisfies ApiError
    }
    if (response.status === 204) {
      return undefined as T
    }
    return (await response.json()) as T
  }

  const clearSession = () => {
    tokensRef.current = null
    setTokens(null)
    setStoredTokens(null)
    setUser(null)
  }

  const updateSession = (nextTokens: AuthTokens) => {
    tokensRef.current = nextTokens
    setTokens(nextTokens)
    setStoredTokens(nextTokens)
  }

  async function refresh(): Promise<AuthTokens | null> {
    const refreshToken = tokensRef.current?.refresh_token
    if (!refreshToken) return null
    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
      const data = await parseResponse<AuthTokens>(res)
      updateSession(data)
      return data
    } catch {
      clearSession()
      return null
    }
  }

  async function authedFetch<T>(path: string, init: RequestInit = {}, retry = true, accessTokenOverride?: string): Promise<T> {
    const accessToken = accessTokenOverride ?? tokensRef.current?.access_token
    const headers = new Headers(init.headers || {})
    if (!headers.has('Content-Type') && init.body) {
      headers.set('Content-Type', 'application/json')
    }
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
    const response = await fetch(path, { ...init, headers })
    if (response.status === 401 && retry && tokensRef.current?.refresh_token) {
      const refreshed = await refresh()
      if (!refreshed) {
        throw { status: 401, message: 'Session expired. Please login again.' } satisfies ApiError
      }
      return authedFetch<T>(path, init, false, refreshed.access_token)
    }
    return parseResponse<T>(response)
  }

  const api = useMemo<AppApi>(
    () => ({
      async login(email, password) {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await parseResponse<AuthTokens>(res)
        updateSession(data)
        const me = await authedFetch<User>('/api/v1/auth/me', {}, true, data.access_token)
        setUser(me)
        return me
      },
      async register(email, password, timezone) {
        const res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, timezone }),
        })
        const data = await parseResponse<AuthTokens>(res)
        updateSession(data)
        const me = await authedFetch<User>('/api/v1/auth/me', {}, true, data.access_token)
        setUser(me)
        return me
      },
      logout() {
        clearSession()
      },
      async me() {
        const me = await authedFetch<User>('/api/v1/auth/me')
        setUser(me)
        return me
      },
      listTasks() {
        return authedFetch<Task[]>('/api/v1/tasks')
      },
      createTask(payload) {
        return authedFetch<Task>('/api/v1/tasks', {
          method: 'POST',
          body: JSON.stringify(trimPayload(payload)),
        })
      },
      updateTask(taskId, payload) {
        return authedFetch<Task>(`/api/v1/tasks/by-id/${taskId}`, {
          method: 'PATCH',
          body: JSON.stringify(trimPayload(payload)),
        })
      },
      deleteTask(taskId) {
        return authedFetch<void>(`/api/v1/tasks/by-id/${taskId}`, {
          method: 'DELETE',
        })
      },
      dailyItems(day) {
        return authedFetch<DailyItemsResponse>(`/api/v1/tasks/daily-items?day=${day}`)
      },
      respondDaily(taskId, response, day, payload) {
        return authedFetch<void>(`/api/v1/tasks/by-id/${taskId}/respond`, {
          method: 'POST',
          body: JSON.stringify(trimPayload({ response, event_date: day, payload })),
        })
      },
      listQuests() {
        return authedFetch<Quest[]>('/api/v1/quests')
      },
      createQuest(payload) {
        return authedFetch<Quest>('/api/v1/quests', {
          method: 'POST',
          body: JSON.stringify(trimPayload(payload)),
        })
      },
      updateQuest(questId, payload) {
        return authedFetch<Quest>(`/api/v1/quests/${questId}`, {
          method: 'PATCH',
          body: JSON.stringify(trimPayload(payload)),
        })
      },
      deleteQuest(questId) {
        return authedFetch<void>(`/api/v1/quests/${questId}`, {
          method: 'DELETE',
        })
      },
      listQuestActivity(questId) {
        return authedFetch<QuestActivity[]>(`/api/v1/quests/${questId}/activity`)
      },
      addQuestActivity(questId, activityType, eventDate, payload) {
        return authedFetch<void>(`/api/v1/quests/${questId}/activity`, {
          method: 'POST',
          body: JSON.stringify(trimPayload({ activity_type: activityType, event_date: eventDate, payload })),
        })
      },
      listJournals(search) {
        const query = search ? `?search=${encodeURIComponent(search)}` : ''
        return authedFetch<Journal[]>(`/api/v1/journals${query}`)
      },
      getJournal(journalId) {
        return authedFetch<Journal>(`/api/v1/journals/${journalId}`)
      },
      createJournal(payload) {
        return authedFetch<Journal>('/api/v1/journals', {
          method: 'POST',
          body: JSON.stringify(trimPayload(payload)),
        })
      },
      updateJournal(journalId, payload) {
        return authedFetch<Journal>(`/api/v1/journals/${journalId}`, {
          method: 'PATCH',
          body: JSON.stringify(trimPayload(payload)),
        })
      },
      deleteJournal(journalId) {
        return authedFetch<void>(`/api/v1/journals/${journalId}`, {
          method: 'DELETE',
        })
      },
      getInsightsOverview(fromDate, toDate) {
        return authedFetch<InsightsOverview>(`/api/v1/insights/overview?from_date=${fromDate}&to_date=${toDate}`)
      },
    }),
    [tokens],
  )

  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      if (!tokens?.access_token) {
        setLoading(false)
        return
      }
      try {
        const me = await authedFetch<User>('/api/v1/auth/me')
        if (mounted) setUser(me)
      } catch {
        if (mounted) clearSession()
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void bootstrap()

    return () => {
      mounted = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      isAuthenticated: Boolean(tokens?.access_token),
      user,
      tokens,
      api,
    }),
    [api, loading, tokens, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
