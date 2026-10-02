export type ActivityItem = {
  id: string
  title: string
  detail: string
  dateLabel: string
}

export type RecentActivityProps = {
  title?: string
  items?: ActivityItem[]
  isSampleData?: boolean
}

const DEFAULT_MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 'a1',
    title: 'Distribution posted (sample)',
    detail: 'Sample Multifamily Fund A',
    dateLabel: 'Mar 1, 2026',
  },
  {
    id: 'a2',
    title: 'Capital call notice (sample)',
    detail: 'Sample Industrial Note B',
    dateLabel: 'Feb 18, 2026',
  },
  {
    id: 'a3',
    title: 'Profile document uploaded (sample)',
    detail: 'Accreditation letter',
    dateLabel: 'Feb 5, 2026',
  },
]

export function RecentActivity({
  title = 'Recent activity',
  items = DEFAULT_MOCK_ACTIVITY,
  isSampleData = true,
}: RecentActivityProps) {
  return (
    <section
      className="island-shell rounded-2xl p-5"
      aria-labelledby="recent-activity-heading"
    >
      <div className="mb-4 flex flex-col gap-2">
        <h2
          id="recent-activity-heading"
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
      <ol className="m-0 list-none divide-y divide-(--line) p-0">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 py-3"
          >
            <div>
              <p className="m-0 text-sm font-semibold text-(--sea-ink)">
                {item.title}
              </p>
              <p className="m-0 text-sm text-(--sea-ink-soft)">{item.detail}</p>
            </div>
            <span className="shrink-0 text-xs text-(--sea-ink-soft)">
              {item.dateLabel}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
