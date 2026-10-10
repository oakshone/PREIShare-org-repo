import { createFileRoute } from '@tanstack/react-router'
import { MetricCard } from '../../components/dashboard/MetricCard'
import { PortfolioSummary } from '../../components/dashboard/PortfolioSummary'
import type { HoldingSnapshot } from '../../components/dashboard/PortfolioSummary'
import { RecentActivity } from '../../components/dashboard/RecentActivity'
import type { ActivityItem } from '../../components/dashboard/RecentActivity'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHomePage,
})

// Shell demo data only — replace with loaders/Supabase in a later sprint topic
const demoMetrics = [
  { label: 'Portfolio value', value: '—', hint: 'Connect data to see live totals' },
  { label: 'Active investments', value: '—', hint: 'No investments loaded yet' },
  { label: 'Distributions (YTD)', value: '—', hint: 'Figures appear after sync' },
]

function DashboardHomePage() {
  // Empty on purpose: shows each widget's empty state until real data exists.
  const portfolioItems: HoldingSnapshot[] = []
  const activityItems: ActivityItem[] = []

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
          Demo shell — no live data is connected yet
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
          <PortfolioSummary
            holdings={portfolioItems}
            emptyMessage="No portfolio holdings to show yet. When your account is linked, summaries will appear here."
          />
        </div>
        <div>
          <RecentActivity
            items={activityItems}
            emptyMessage="No recent activity yet. Distributions, documents, and updates will list here."
          />
        </div>
      </div>
    </section>
  )
}
