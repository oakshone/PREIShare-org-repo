import { createFileRoute } from '@tanstack/react-router'
import { PortfolioTable } from '../../components/dashboard/PortfolioTable'

export const Route = createFileRoute('/dashboard/portfolio')({
  component: PortfolioPage,
})

function PortfolioPage() {
  return (
    <section
      aria-labelledby="dashboard-portfolio-heading"
      className="flex flex-col gap-6"
    >
      <h2 id="dashboard-portfolio-heading" className="sr-only">
        Portfolio
      </h2>
      <p className="m-0 text-sm text-(--sea-ink-soft)">
        Review your holdings at a glance.
      </p>
      {/* No holdings prop: PortfolioTable uses its built-in MOCK holdings. */}
      <PortfolioTable />
    </section>
  )
}
