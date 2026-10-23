// Layout route for everything under /dashboard.
// Guard: signed-out visitors are sent to /auth/login (and back here after signing in).
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppShell } from '../../components/dashboard/AppShell'
import { SignOutButton } from '../../components/dashboard/SignOutButton'
import { getCurrentUser } from '../../lib/auth.functions'

export const Route = createFileRoute('/dashboard')({
  // Runs before any /dashboard page loads (on the server for the first visit, in the browser on
  // link clicks). Either way the check itself runs on the server: getCurrentUser is a server
  // function that returns getSessionUser() from src/lib/auth/session.ts, which verifies the
  // session with auth.getUser() rather than trusting it via auth.getSession().
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({ to: '/auth/login', search: { redirect: location.href } })
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
