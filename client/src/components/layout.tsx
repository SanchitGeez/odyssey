import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../app/auth'
import { Icon } from './icons'

type ShellProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

const navItems = [
  { to: '/check-in', label: 'Check-In', icon: 'shield' },
  { to: '/tasks', label: 'Tasks', icon: 'scroll' },
  { to: '/quests', label: 'Quests', icon: 'compass' },
  { to: '/journals', label: 'Journal', icon: 'book' },
  { to: '/insights', label: 'Insights', icon: 'eye' },
  { to: '/settings', label: 'Settings', icon: 'gear' },
]

const mobileNavItems = navItems.slice(0, 5)

export function AppShell({ title, subtitle, actions, children }: ShellProps) {
  const { user, api } = useAuth()

  return (
    <>
      <div className="ody-app-shell">
        <aside className="ody-sidebar">
          <div className="ody-nav-brand">
            <div className="ody-nav-caption">Odyssey</div>
            <h1 className="ody-brand">Chronicle</h1>
          </div>
          <div className="ody-ornament" aria-hidden="true"><span /></div>
          <nav className="ody-nav" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `ody-nav-link${isActive ? ' active' : ''}`}
              >
                <Icon name={item.icon} size={18} />
                <span className="ody-nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="ody-sidebar-footer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{user?.email?.split('@')[0] || 'User'}</span>
              <button className="ody-icon-btn" onClick={api.logout} aria-label="Logout">
                <Icon name="logout" size={16} />
              </button>
            </div>
          </div>
        </aside>

        <main className="ody-main">
          <header className="ody-topbar">
            <div className="ody-page-header">
              <h2 className="ody-page-title">{title}</h2>
              {subtitle ? <p className="ody-page-subtitle">{subtitle}</p> : null}
            </div>
            <div className="ody-topbar-actions">
              {actions}
            </div>
          </header>
          {children}
        </main>
      </div>

      <nav className="ody-mobile-nav" aria-label="Mobile navigation">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `ody-mobile-nav-link${isActive ? ' active' : ''}`}
          >
            <Icon name={item.icon} size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="ody-auth-wrap">
      <section className="ody-card ody-auth-card">
        <div className="ody-ornament" aria-hidden="true"><span /></div>
        <h1 className="ody-auth-title">{title}</h1>
        <p className="ody-page-subtitle" style={{ marginTop: 0 }}>{subtitle}</p>
        {children}
      </section>
    </div>
  )
}
