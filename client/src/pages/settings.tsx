import { AppShell } from '../components/layout'
import { Link } from 'react-router-dom'
import { Icon } from '../components/icons'
import { useAuth } from '../app/auth'

export function SettingsPage() {
  const { user, api } = useAuth()

  return (
    <AppShell title="Settings" subtitle="Account and session controls">
      <div className="ody-grid" style={{ maxWidth: 560 }}>
        <article className="ody-card">
          <div className="ody-section-header">
            <h3 className="ody-section-title">Account</h3>
            <Icon name="user" size={18} className="ody-muted" />
          </div>
          <div className="ody-grid" style={{ gap: 12 }}>
            <div className="ody-row">
              <span className="ody-label" style={{ minWidth: 80 }}>Email</span>
              <span style={{ fontSize: '0.88rem' }}>{user?.email}</span>
            </div>
            <div className="ody-row">
              <span className="ody-label" style={{ minWidth: 80 }}>Timezone</span>
              <span style={{ fontSize: '0.88rem' }}>{user?.timezone}</span>
            </div>
          </div>
        </article>

        <article className="ody-card">
          <div className="ody-section-header">
            <h3 className="ody-section-title">Session</h3>
            <Icon name="logout" size={18} className="ody-muted" />
          </div>
          <p className="ody-muted" style={{ margin: '0 0 16px', fontSize: '0.82rem', lineHeight: 1.5 }}>
            Clear your local session and return to the login screen.
          </p>
          <button className="ody-btn danger" onClick={api.logout}>
            <Icon name="logout" size={14} /> Sign Out
          </button>
        </article>

        <article className="ody-card">
          <div className="ody-section-header">
            <h3 className="ody-section-title">Guide</h3>
            <Icon name="scroll" size={18} className="ody-muted" />
          </div>
          <p className="ody-muted" style={{ margin: '0 0 16px', fontSize: '0.82rem', lineHeight: 1.6 }}>
            Read the full Life Dimensions guide with practical examples for habits and goals.
          </p>
          <Link to="/help" style={{ textDecoration: 'none' }}>
            <button className="ody-btn secondary">
              <Icon name="book" size={14} /> Open Guide
            </button>
          </Link>
        </article>

        <article className="ody-card">
          <div className="ody-section-header">
            <h3 className="ody-section-title">About</h3>
          </div>
          <p className="ody-muted" style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.6 }}>
            Odyssey Chronicle — a holistic life management app.
            Track across 6 life dimensions in 60 seconds a day.
          </p>
          <p className="ody-muted" style={{ margin: '8px 0 0', fontSize: '0.72rem', letterSpacing: '0.06em' }}>
            Stage 1 MVP &middot; Version 1.1
          </p>
        </article>
      </div>
    </AppShell>
  )
}
