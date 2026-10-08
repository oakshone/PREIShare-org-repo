import type { ReactNode } from 'react'

export type MetricCardProps = {
  /** Short name of the metric, e.g. "Open deals". */
  label: string
  /** The main value, already formatted as text, e.g. "$300,000". */
  value: string
  /** Optional helper or change line under the value, e.g. "Sample total" or "+2 this month". */
  hint?: string
  /** Optional icon or badge slot for later polish. */
  icon?: ReactNode
}

/**
 * Reusable metric tile for the investor dashboard.
 * Presentational only: it shows the props it's given and never fetches or calculates data.
 *
 * Sample usage — MOCK values only, not live investor data:
 *   <MetricCard label="Open deals" value="3" hint="Sample count" />
 */
export function MetricCard({ label, value, hint, icon }: MetricCardProps) {
  return (
    <article className="island-shell rounded-2xl p-5" aria-label={label}>
      <div className="flex items-center justify-between gap-2">
        <p className="island-kicker m-0">{label}</p>
        {icon ? <span>{icon}</span> : null}
      </div>
      <p className="display-title m-0 mt-2 text-3xl font-bold text-(--sea-ink)">
        {value}
      </p>
      {hint ? (
        <p className="m-0 mt-1 text-sm text-(--sea-ink-soft)">{hint}</p>
      ) : null}
    </article>
  )
}
