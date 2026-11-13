import { MotionConfig } from 'motion/react'
import { AuthProvider } from './app/auth'
import { AppRouter } from './app/router'
import { ToastProvider } from './components/toast'

export function App() {
  return (
    <MotionConfig reducedMotion="user"><AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider></MotionConfig>
  )
}
