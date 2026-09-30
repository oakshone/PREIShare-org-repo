import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div data-area="dashboard-layout">
      <p>PREIshare investor dashboard layout (shell comes next)</p>
      <Outlet />
    </div>
  )
}
