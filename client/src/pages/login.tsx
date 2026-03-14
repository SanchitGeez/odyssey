import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/auth'
import { AuthCard } from '../components/layout'
import { Icon } from '../components/icons'
import { isOnboardingComplete } from '../lib/storage'

export function LoginPage() {
  const navigate = useNavigate()
  const { api } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const me = await api.login(email, password)
      navigate(isOnboardingComplete(me.id) ? '/check-in' : '/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to continue your journey.">
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
        <button className="ody-btn" type="submit" disabled={loading}>
          <Icon name="arrow-right" size={14} />
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="ody-muted" style={{ margin: 0, fontSize: '0.78rem' }}>
          New here? <Link to="/register">Create account</Link>
        </p>
      </form>
    </AuthCard>
  )
}
