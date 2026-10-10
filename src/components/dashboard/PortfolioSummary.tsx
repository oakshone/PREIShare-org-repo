import { useId } from 'react'

export type HoldingSnapshot = {
  id: string
  /** Holding name shown to the investor. */
  name: string
  /** Share of the portfolio, already formatted, e.g. "40%". */
  allocationLabel: string
  /** Holding value, already formatted, e.g. "$120,000". */
  valueLabel: string
}

export type PortfolioSummaryProps = {
  title?: string
  /** Portfolio total, already formatted, e.g. "$300,000"; shows "—" when omitted. */
  totalLabel?: string
  /** Holdings to list; defaults to the built-in MOCK holdings below. */
  holdings?: HoldingSnapshot[]
  /** Shows the sample-data note and "(sample)" labels; leave true for mock data. */
  isSampleData?: boolean
  /** Shown when `holdings` is an empty list. */
  emptyMessage?: string
}

// MOCK placeholder holdings — made-up names and amounts, not live investor data.
// Same three holdings as PortfolioTable's mock, so Home and Portfolio agree.
const DEFAULT_MOCK_HOLDINGS: HoldingSnapshot[] = [
  {
    id: 'h1',
    name: 'Sample Riverfront Apartments',
    allocationLabel: '40%',
    valueLabel: '$120,000',
  },
  {
    id: 'h2',
    name: 'Sample Gateway Logistics Center',
    allocationLabel: '35%',
    valueLabel: '$105,000',
  },
  {
    id: 'h3',
    name: 'Sample Midtown Office Note',
    allocationLabel: '25%',
    valueLabel: '$75,000',
  },
]

/**
 * Short portfolio snapshot for the dashboard home: total plus a few holdings.
 * Presentational only: it shows the props it's given and never fetches data.
 */
export function PortfolioSummary({
  title = 'Portfolio summary',
  totalLabel = '—',
  holdings = DEFAULT_MOCK_HOLDINGS,
  isSampleData = true,
  emptyMessage = 'No holdings to show yet.',
}: PortfolioSummaryProps) {
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
            Sample data — placeholders only, not live balances
          </p>
        ) : null}
      </div>
      <p className="m-0 mb-3 flex items-baseline justify-between gap-3">
        <span className="text-sm text-(--sea-ink-soft)">
          {isSampleData ? 'Total (sample)' : 'Total'}
        </span>
        <span className="display-title text-2xl font-bold text-(--sea-ink)">
          {totalLabel}
        </span>
      </p>
      {holdings.length === 0 ? (
        <p className="m-0 text-sm text-(--sea-ink-soft)">{emptyMessage}</p>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-(--line) pb-1 text-xs font-semibold text-(--sea-ink-soft)"
          >
            <span>Holding</span>
            <span>Allocation</span>
            <span>Value</span>
          </div>
          <ul className="m-0 list-none divide-y divide-(--line) p-0">
            {holdings.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2 text-sm text-(--sea-ink)"
              >
                <span className="font-semibold">{item.name}</span>
                <span className="text-(--sea-ink-soft)">
                  <span className="sr-only">Allocation: </span>
                  {item.allocationLabel}
                </span>
                <span>
                  <span className="sr-only">Value: </span>
                  {item.valueLabel}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
