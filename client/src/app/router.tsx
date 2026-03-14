import { Navigate, Outlet, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './auth'
import { CheckInPage } from '../pages/checkin'
import { InsightsPage } from '../pages/insights'
import { JournalsPage } from '../pages/journals'
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

export function AppRouter() {
  return (
    <Router>
      <Routes>
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
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/check-in" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
