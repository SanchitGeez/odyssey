import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/auth'
import { AuthCard } from '../components/layout'
import { Icon } from '../components/icons'

export function RegisterPage() {
  const { api } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.register(email, password, timezone)
      navigate('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Create Account" subtitle="Begin tracking your life dimensions.">
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
            minLength={8}
            placeholder="Password (min 8 characters)"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="ody-field">
          <input
            className="ody-input"
            placeholder="Timezone"
            aria-label="Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            required
          />
        </div>
        {error ? <p className="ody-error" style={{ margin: 0 }}>{error}</p> : null}
        <button className="ody-btn" type="submit" disabled={loading}>
          <Icon name="shield" size={14} />
          {loading ? 'Creating account...' : 'Begin Your Odyssey'}
        </button>
        <p className="ody-muted" style={{ margin: 0, fontSize: '0.78rem' }}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthCard>
  )
}
