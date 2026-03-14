import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../app/auth'

type ShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

const navItems = [
  { to: '/check-in', label: 'Check-In' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/quests', label: 'Quests' },
  { to: '/journals', label: 'Journals' },
  { to: '/insights', label: 'Insights' },
  { to: '/settings', label: 'Settings' },
]

export function AppShell({ title, subtitle, children }: ShellProps) {
  const { user, api } = useAuth()

  return (
    <div className="ody-app-shell">
      <aside className="ody-sidebar">
        <div className="ody-nav-caption">ODYSSEY</div>
        <h1 className="ody-brand">Chronicle</h1>
        <div className="ody-ornament" aria-hidden="true">
          <span />
        </div>
        <nav className="ody-nav" aria-label="Primary">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `ody-nav-link${isActive ? ' active' : ''}`}
            >
              <span className="ody-nav-index">{`${index + 1}`.padStart(2, '0')}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ody-sidebar-footer">Cinematic Life OS</div>
      </aside>

      <main className="ody-main">
        <header className="ody-topbar">
          <div className="ody-page-header">
            <div className="ody-ornament" aria-hidden="true">
              <span />
            </div>
            <h2 className="ody-page-title">{title}</h2>
            {subtitle ? <p className="ody-page-subtitle">{subtitle}</p> : null}
          </div>
          <div className="ody-row">
            <span className="ody-badge">{user?.email || 'Anonymous'}</span>
            <button type="button" className="ody-btn secondary" onClick={api.logout}>
              Logout
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="ody-auth-wrap">
      <section className="ody-card ody-auth-card">
        <div className="ody-ornament" aria-hidden="true">
          <span />
        </div>
        <h1 className="ody-auth-title">{title}</h1>
        <p className="ody-page-subtitle" style={{ marginTop: 0 }}>{subtitle}</p>
        {children}
      </section>
    </div>
  )
}
