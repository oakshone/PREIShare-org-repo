import { createFileRoute } from '@tanstack/react-router'
import { DealsList } from '../../components/dashboard/DealsList'

export const Route = createFileRoute('/dashboard/deals')({
  component: DealsPage,
})

function DealsPage() {
  return (
    <section
      aria-labelledby="dashboard-deals-heading"
      className="flex flex-col gap-6"
    >
      <h2 id="dashboard-deals-heading" className="sr-only">
        Deals
      </h2>
      <p className="m-0 text-sm text-(--sea-ink-soft)">
        Browse open and featured offerings.
      </p>
      {/* No deals prop: DealsList uses its built-in MOCK deals. */}
      <DealsList />
    </section>
  )
}
