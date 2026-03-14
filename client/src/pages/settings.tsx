import { AppShell } from '../components/layout'
import { useAuth } from '../app/auth'

export function SettingsPage() {
  const { user, api } = useAuth()

  return (
    <AppShell title="Settings" subtitle="Session and account controls.">
      <section className="ody-card ody-grid">
        <h3 style={{ marginTop: 0 }}>Account</h3>
        <div className="ody-row">
          <span className="ody-muted">Email</span>
          <span>{user?.email}</span>
        </div>
        <div className="ody-row">
          <span className="ody-muted">Timezone</span>
          <span>{user?.timezone}</span>
        </div>
      </section>

      <section className="ody-card ody-grid" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Session</h3>
        <p className="ody-muted" style={{ margin: 0 }}>
          Use this control to clear local tokens and return to public routes.
        </p>
        <button className="ody-btn danger" onClick={api.logout}>
          Logout
        </button>
      </section>
    </AppShell>
  )
}
