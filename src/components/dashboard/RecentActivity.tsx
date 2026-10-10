import { useId } from 'react'

/** The kinds of activity the list knows how to label. */
export type ActivityType = 'distribution' | 'capital_call' | 'document' | 'update'

export type ActivityItem = {
  id: string
  /** When it happened, already formatted for display, e.g. "Oct 1, 2026". */
  timestamp: string
  /** What happened, in plain words. */
  description: string
  /** Optional kind of activity, shown as a small tag. */
  type?: ActivityType
}

export type RecentActivityProps = {
  title?: string
  /** Activity to list; defaults to the built-in MOCK items below. */
  items?: ActivityItem[]
  /** Shows the sample-data note; leave true for mock data. */
  isSampleData?: boolean
  /** Shown when `items` is an empty list. */
  emptyMessage?: string
}

const TYPE_LABELS: Record<ActivityType, string> = {
  distribution: 'Distribution',
  capital_call: 'Capital call',
  document: 'Document',
  update: 'Update',
}

// MOCK placeholder activity — made-up events and dates, not live account history.
const DEFAULT_MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 'a1',
    timestamp: 'Oct 1, 2026',
    description: '$3,200 quarterly distribution posted for Sample Riverfront Apartments',
    type: 'distribution',
  },
  {
    id: 'a2',
    timestamp: 'Sep 22, 2026',
    description: 'Capital call notice for Sample Midtown Office Note',
    type: 'capital_call',
  },
  {
    id: 'a3',
    timestamp: 'Sep 9, 2026',
    description: 'Q2 investor update shared for Sample Gateway Logistics Center',
    type: 'update',
  },
]

/**
 * Short list of recent investor activity for the dashboard home.
 * Presentational only: it shows the props it's given and never fetches data.
 */
export function RecentActivity({
  title = 'Recent activity',
  items = DEFAULT_MOCK_ACTIVITY,
  isSampleData = true,
  emptyMessage = 'No recent activity yet.',
}: RecentActivityProps) {
  const headingId = useId()

  return (
    <section className="island-shell rounded-2xl p-5" aria-labelledby={headingId}>
      <div className="mb-4 flex flex-col gap-2">
        <h2
          id={headingId}
          className="display-title m-0 text-xl font-bold text-(--sea-ink)"
        >
          {title}
        </h2>
        {isSampleData ? (
          <p
            role="note"
            className="m-0 rounded-xl border border-(--line) bg-(--chip-bg) px-3 py-2 text-xs font-semibold text-(--sea-ink-soft)"
          >
            Sample activity — not connected to a live feed
          </p>
        ) : null}
      </div>
      {items.length === 0 ? (
        <p className="m-0 text-sm text-(--sea-ink-soft)">{emptyMessage}</p>
      ) : (
        <ol className="m-0 list-none divide-y divide-(--line) p-0">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                {item.type ? (
                  <p className="island-kicker m-0 mb-1">{TYPE_LABELS[item.type]}</p>
                ) : null}
                <p className="m-0 text-sm text-(--sea-ink)">{item.description}</p>
              </div>
              <span className="shrink-0 text-xs text-(--sea-ink-soft)">
                {item.timestamp}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
