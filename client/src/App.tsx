import { AuthProvider } from './app/auth'
import { AppRouter } from './app/router'
import { ToastProvider } from './components/toast'

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  )
}
