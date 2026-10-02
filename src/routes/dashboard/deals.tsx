import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/deals')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/deals"!</div>
}
