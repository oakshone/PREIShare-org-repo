import { createFileRoute } from '@tanstack/react-router'
import { PortfolioSummary } from '../../components/dashboard/PortfolioSummary'
import { RecentActivity } from '../../components/dashboard/RecentActivity'
import { StatsCard } from '../../components/dashboard/StatsCard'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHomePage,
})

function DashboardHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <p
        role="note"
        className="m-0 rounded-xl border border-(--line) bg-(--chip-bg) px-3 py-2 text-xs font-semibold text-(--sea-ink-soft)"
      >
        Demo shell — all figures are placeholders
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          label="Total portfolio value"
          value="$300,000"
          hint="Sample total"
        />
        <StatsCard label="Open deals" value="3" hint="Sample count" />
        <StatsCard
          label="Contributions YTD"
          value="$24,000"
          hint="Sample YTD"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <PortfolioSummary totalLabel="$300,000" />
        <RecentActivity />
      </div>
    </div>
  )
}
