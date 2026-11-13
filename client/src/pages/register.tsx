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
  const [showPassword, setShowPassword] = useState(false)
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
        <label className="ody-field">
          <span className="ody-label">Email</span>
          <input
            autoComplete="email"
            name="email"
            className="ody-input"
            type="email"
            placeholder="Email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="ody-field">
          <span className="ody-label">Password</span>
          <span className="ody-password-wrap">
          <input
            autoComplete="new-password"
            name="password"
            className="ody-input"
            type={showPassword ? 'text' : 'password'}
            minLength={8}
            placeholder="Password (min 8 characters)"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="button" className="ody-icon-btn" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}><Icon name={showPassword ? 'hidden' : 'visible'} /></button>
          </span>
          <span className="ody-muted" style={{fontSize:12}}>Use at least 8 characters.</span>
        </label>
        <label className="ody-field">
          <span className="ody-label">Timezone</span>
          <input
            name="timezone"
            className="ody-input"
            placeholder="Timezone"
            aria-label="Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            required
          />
          <span className="ody-muted" style={{fontSize:12}}>For example, Asia/Kolkata or Europe/London.</span>
        </label>
        {error ? <p role="alert" className="ody-error" style={{ margin: 0 }}>{error}</p> : null}
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
