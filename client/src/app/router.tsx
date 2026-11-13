import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, RouterProvider, ScrollRestoration, createBrowserRouter, createRoutesFromElements, useLocation } from 'react-router-dom'
import { useAuth } from './auth'
import { CheckInPage } from '../pages/checkin'
import { InsightsPage } from '../pages/insights'
import { JournalsPage } from '../pages/journals'
const JournalReadPage = lazy(() => import('../pages/journal-read').then(module => ({ default: module.JournalReadPage })))
const JournalWritePage = lazy(() => import('../pages/journal-write').then(module => ({ default: module.JournalWritePage })))
import { HelpPage } from '../pages/help'
import { LoginPage } from '../pages/login'
import { OnboardingPage } from '../pages/onboarding'
import { QuestsPage } from '../pages/quests'
import { RegisterPage } from '../pages/register'
import { SettingsPage } from '../pages/settings'
import { TasksPage } from '../pages/tasks'
import { isOnboardingComplete } from '../lib/storage'

function ProtectedRoute() {
  const { loading, isAuthenticated, user } = useAuth()
  const location = useLocation()
  if (loading || (isAuthenticated && !user)) {
    return <div className="ody-auth-wrap"><div className="ody-card">Loading session...</div></div>
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (!isOnboardingComplete(user?.id ?? null) && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}

function PublicOnlyRoute() {
  const { loading, isAuthenticated, user } = useAuth()
  if (loading || (isAuthenticated && !user)) {
    return <div className="ody-auth-wrap"><div className="ody-card">Loading session...</div></div>
  }
  if (isAuthenticated) {
    if (isOnboardingComplete(user?.id ?? null)) {
      return <Navigate to="/check-in" replace />
    }
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}

function NavigationRoot() { return <><ScrollRestoration /><Outlet /></> }

const router = createBrowserRouter(createRoutesFromElements(<Route element={<NavigationRoot />}>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/quests" element={<QuestsPage />} />
          <Route path="/journals" element={<JournalsPage />} />
          <Route path="/journals/new" element={<JournalWritePage />} />
          <Route path="/journals/:id" element={<JournalReadPage />} />
          <Route path="/journals/:id/edit" element={<JournalWritePage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/check-in" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
</Route>))

export function AppRouter() {
  return <Suspense fallback={<div className="journal-loading" role="status">Opening your journal...</div>}><RouterProvider router={router} /></Suspense>
}
