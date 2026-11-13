import { useRef, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { useAuth } from '../app/auth'
import { Icon } from './icons'

const navItems = [
  { to: '/check-in', label: 'Check-In', icon: 'shield' },
  { to: '/tasks', label: 'Tasks', icon: 'scroll' },
  { to: '/quests', label: 'Quests', icon: 'compass' },
  { to: '/journals', label: 'Journal', icon: 'book' },
  { to: '/insights', label: 'Insights', icon: 'eye' },
]
const routeArt: Record<string, { src: string; description: string }> = {
  '/tasks': { src: '/art/bronze.webp', description: 'Small commitments. Steady progress.' },
  '/quests': { src: '/art/sanctuary.webp', description: 'Choose your destination. Take the next step.' },
  '/journals': { src: '/art/voyage.webp', description: 'Make room for reflection.' },
  '/insights': { src: '/art/last-light.webp', description: 'See the work you have put in.' },
}
function Navigation({ mobile = false }: { mobile?: boolean }) {
  return <nav className={mobile ? 'ody-mobile-nav' : 'ody-nav'} aria-label={mobile ? 'Mobile navigation' : 'Primary'}>
    {navItems.map(item => <NavLink key={item.to} to={item.to} className={({ isActive }) => `${mobile ? 'ody-mobile-nav-link' : 'ody-nav-link'}${isActive ? ' active' : ''}`}>
      {({ isActive }) => <>{isActive && <motion.span className="ody-nav-current" layoutId={mobile ? 'mobile-navigation' : 'desktop-navigation'} transition={{ type: 'spring', stiffness: 420, damping: 38 }} />}<Icon name={item.icon} size={mobile ? 22 : 21} /><span>{item.label}</span></>}
    </NavLink>)}
  </nav>
}
export function AppShell({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  const { user, api } = useAuth()
  const { pathname } = useLocation()
  const reduce = useReducedMotion()
  const account = useRef<HTMLDetailsElement>(null)
  const art = routeArt[pathname]
  return <>
    <a className="ody-skip-link" href="#main-content">Skip to content</a>
    <div className="ody-app-shell">
      <aside className="ody-sidebar">
        <Link to="/check-in" className="ody-wordmark" aria-label="Odyssey home">Odyssey<span>Chronicle</span></Link>
        <Navigation />
        <p className="ody-sidebar-mantra">A little further,<br />every day.</p>
        <div className="ody-sidebar-secondary">
          <NavLink to="/settings" className="ody-nav-link"><Icon name="gear" />Settings</NavLink>
          <NavLink to="/help" className="ody-nav-link"><Icon name="help" />Life dimensions</NavLink>
        </div>
        <div className="ody-sidebar-footer"><span className="ody-avatar" aria-hidden="true">{user?.email?.slice(0, 1).toUpperCase()}</span><span className="ody-account-name">{user?.email?.split('@')[0]}<small>Your personal odyssey</small></span><button className="ody-icon-btn" onClick={api.logout} aria-label="Sign out"><Icon name="logout" /></button></div>
      </aside>
      <div className="ody-workspace">
        <header className="ody-utility-bar">
          <Link className="ody-mobile-wordmark" to="/check-in">Odyssey</Link>
          <span className="ody-today"><Icon name="calendar" size={17} />{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</span>
          <details ref={account} className="ody-account-menu" onKeyDown={event => { if (event.key === 'Escape' && account.current) { account.current.open = false; account.current.querySelector('summary')?.focus() } }}>
            <summary aria-label="Account menu"><span className="ody-avatar" aria-hidden="true">{user?.email?.slice(0, 1).toUpperCase()}</span><span className="ody-account-label">Your account</span><Icon name="chevron-down" size={14} /></summary>
            <div className="ody-account-popover"><span>{user?.email}</span><Link to="/settings" onClick={() => { if (account.current) account.current.open = false }}><Icon name="gear" />Settings</Link><Link to="/help" onClick={() => { if (account.current) account.current.open = false }}><Icon name="help" />Life dimensions</Link><button onClick={api.logout}><Icon name="logout" />Sign out</button></div>
          </details>
        </header>
        <main id="main-content" className={`ody-main ody-route-${pathname.split('/')[1] || 'home'}`} tabIndex={-1}>
          <motion.div key={pathname} initial={reduce ? false : { opacity: 0.6, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}>
            <header className={`ody-topbar${art ? ' ody-topbar-illustrated' : ''}`}>
              {art && <img className="ody-header-art" src={art.src} alt="" fetchPriority="high" />}
              <div className="ody-page-header"><h1 className="ody-page-title">{title}</h1>{subtitle && <p className="ody-page-subtitle">{subtitle}</p>}{art && <p className="ody-header-note">{art.description}</p>}</div>
              {actions && <div className="ody-topbar-actions">{actions}</div>}
            </header>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
    <Navigation mobile />
  </>
}
export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const reduce = useReducedMotion()
  return <main className="ody-auth-wrap">
    <section className="ody-auth-scene"><img src="/art/sanctuary.webp" alt="An ancient temple lit by golden light in a forest gorge" /><Link to="/login" className="ody-wordmark">Odyssey<span>Chronicle</span></Link><div><h2>Your journey.<br />Your own pace.</h2><p>Build your commitments. Find your direction.<br />Make time to reflect.</p></div></section>
    <motion.section className="ody-auth-card" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}><Link to="/login" className="ody-mobile-wordmark">Odyssey</Link><h1 className="ody-auth-title">{title}</h1><p className="ody-page-subtitle">{subtitle}</p>{children}</motion.section>
  </main>
}
