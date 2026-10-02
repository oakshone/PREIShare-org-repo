import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell } from '../components/layout/AppShell'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
