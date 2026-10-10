import { createFileRoute } from '@tanstack/react-router'
import { MetricCard } from '../../components/dashboard/MetricCard'
import { PortfolioSummary } from '../../components/dashboard/PortfolioSummary'
import { RecentActivity } from '../../components/dashboard/RecentActivity'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHomePage,
})

// Shell demo data only — replace with loaders/Supabase in a later sprint topic.
// MOCK figures match the sample holdings on the Portfolio page
// ($265,000 invested, $300,000 current value, 2 active + 1 pending).
const demoMetrics = [
  { label: 'Portfolio value', value: '$300,000', hint: 'Sample · 3 holdings' },
  { label: 'Active investments', value: '2', hint: 'Sample · 1 more pending' },
  { label: 'Distributions (YTD)', value: '$6,400', hint: 'Sample · 2 quarterly payouts' },
]

function DashboardHomePage() {
  return (
    <section
      aria-labelledby="dashboard-home-heading"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <h2 id="dashboard-home-heading" className="sr-only">
          Home overview
        </h2>
        <p className="m-0 text-sm text-(--sea-ink-soft)">
          Your PREIshare home base for portfolio metrics and recent activity.
        </p>
        <p
          role="note"
          className="m-0 rounded-xl border border-(--line) bg-(--chip-bg) px-3 py-2 text-xs font-semibold text-(--sea-ink-soft)"
        >
          Demo shell — sample figures only, no live data is connected yet
        </p>
      </div>

      <section
        aria-label="Key metrics"
        className="dash-grid-metrics"
      >
        {demoMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
          />
        ))}
      </section>

      <div className="dash-grid-split">
        <div>
          {/* No holdings prop: uses the built-in MOCK holdings (same as Portfolio page) */}
          <PortfolioSummary
            totalLabel="$300,000"
            emptyMessage="No portfolio holdings to show yet. When your account is linked, summaries will appear here."
          />
        </div>
        <div>
          {/* No items prop: uses the built-in MOCK activity */}
          <RecentActivity
            emptyMessage="No recent activity yet. Distributions, documents, and updates will list here."
          />
        </div>
      </div>
    </section>
  )
}
