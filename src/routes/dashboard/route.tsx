// Layout route for everything under /dashboard.
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell } from '../../components/layout/AppShell'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <AppShell>
      {/* Child routes (like index) render inside Outlet */}
      <Outlet />
    </AppShell>
  )
}
