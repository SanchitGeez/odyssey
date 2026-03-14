import { AuthProvider } from './app/auth'
import { AppRouter } from './app/router'

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
