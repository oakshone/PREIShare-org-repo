// Layout route for everything under /dashboard.
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell } from '../../components/dashboard/AppShell'
import { Sidebar } from '../../components/layout/Sidebar'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <AppShell sidebar={<Sidebar />}>
      {/* Child routes (like index) render inside Outlet */}
      <Outlet />
    </AppShell>
  )
}
