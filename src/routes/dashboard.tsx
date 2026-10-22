// Layout route for everything under /dashboard.
// Guard: signed-out visitors are sent to /login (and back here after signing in).
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppShell } from '../components/dashboard/AppShell'
import { SignOutButton } from '../components/dashboard/SignOutButton'
import { getCurrentUser } from '../lib/auth.functions'

export const Route = createFileRoute('/dashboard')({
  // Runs before any /dashboard page loads, on the server for the first visit and on link clicks.
  // Template adaptations: this calls the getCurrentUser server function (not the server client
  // directly, which browser code can't import), and that verifies the session with
  // auth.getUser() rather than trusting it via auth.getSession().
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { user }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const { user } = Route.useRouteContext()

  return (
    <AppShell
      actions={<SignOutButton />}
      userLabel={user.email ?? 'Signed-in sponsor'}
      statusLabel="Signed in · sample data"
    >
      {/* Child routes (like index) render inside Outlet */}
      <Outlet />
    </AppShell>
  )
}
