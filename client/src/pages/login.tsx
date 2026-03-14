import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/auth'
import { AuthCard } from '../components/layout'
import { isOnboardingComplete } from '../lib/storage'

export function LoginPage() {
  const navigate = useNavigate()
  const { api } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const me = await api.login(email, password)
      const userId = me.id
      if (isOnboardingComplete(userId)) {
        navigate('/check-in')
      } else {
        navigate('/onboarding')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue your journey.">
      <form className="ody-grid" onSubmit={onSubmit}>
        <div className="ody-field">
          <input
            className="ody-input"
            type="email"
            placeholder="Email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="ody-field">
          <input
            className="ody-input"
            type="password"
            placeholder="Password"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="ody-error" style={{ margin: 0 }}>{error}</p> : null}
        <button className="ody-btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        <p className="ody-muted" style={{ margin: 0 }}>
          New here? <Link to="/register">Create account</Link>
        </p>
      </form>
    </AuthCard>
  )
}
