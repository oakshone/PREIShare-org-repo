import { useId } from 'react'
import type { PropertyType } from '../../types'

/** Where the investor's position stands. */
export type HoldingStatus = 'active' | 'pending' | 'exited'

export type PortfolioHolding = {
  id: string
  /** Property or offering name shown to the investor. */
  propertyName: string
  /** Asset class, from the shared listing vocabulary. */
  propertyType: PropertyType
  /** Amount the investor put in, in US dollars. */
  investedAmount: number
  /** Current estimated value of the position, in US dollars. */
  currentValue: number
  status: HoldingStatus
}

export type PortfolioTableProps = {
  title?: string
  /** Rows to show; defaults to the built-in MOCK holdings below. */
  holdings?: PortfolioHolding[]
  /** Shows the sample-data note; leave true for mock data. */
  isSampleData?: boolean
  /** Shown when `holdings` is an empty list. */
  emptyMessage?: string
}

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  multifamily: 'Multifamily',
  office: 'Office',
  retail: 'Retail',
  industrial: 'Industrial',
  mixed_use: 'Mixed use',
  land: 'Land',
}

const STATUS_LABELS: Record<HoldingStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  exited: 'Exited',
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

// MOCK placeholder holdings — made-up properties and amounts, not live investor data.
const DEFAULT_MOCK_HOLDINGS: PortfolioHolding[] = [
  {
    id: 'ph1',
    propertyName: 'Sample Riverfront Apartments',
    propertyType: 'multifamily',
    investedAmount: 100000,
    currentValue: 120000,
    status: 'active',
  },
  {
    id: 'ph2',
    propertyName: 'Sample Gateway Logistics Center',
    propertyType: 'industrial',
    investedAmount: 90000,
    currentValue: 105000,
    status: 'active',
  },
  {
    id: 'ph3',
    propertyName: 'Sample Midtown Office Note',
    propertyType: 'office',
    investedAmount: 75000,
    currentValue: 75000,
    status: 'pending',
  },
]

/**
 * Holdings table for the Portfolio page.
 * Presentational only: it shows the props it's given and never fetches data.
 * Scrolls sideways on narrow screens instead of squeezing the columns.
 */
export function PortfolioTable({
  title = 'Holdings',
  holdings = DEFAULT_MOCK_HOLDINGS,
  isSampleData = true,
  emptyMessage = 'No holdings to show yet.',
}: PortfolioTableProps) {
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
            Sample data — placeholders only, not live holdings
          </p>
        ) : null}
      </div>

      {holdings.length === 0 ? (
        <p className="m-0 text-sm text-(--sea-ink-soft)">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm text-(--sea-ink)">
            <thead>
              <tr className="border-b border-(--line) text-xs text-(--sea-ink-soft)">
                <th scope="col" className="py-2 pr-3 font-semibold">Property</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Type</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Invested</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Current value</th>
                <th scope="col" className="py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--line)">
              {holdings.map((holding) => (
                <tr key={holding.id}>
                  <th scope="row" className="py-2 pr-3 font-semibold">
                    {holding.propertyName}
                  </th>
                  <td className="py-2 pr-3 text-(--sea-ink-soft)">
                    {PROPERTY_TYPE_LABELS[holding.propertyType]}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {usd.format(holding.investedAmount)}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {usd.format(holding.currentValue)}
                  </td>
                  <td className="py-2">
                    <span className="rounded-full bg-(--chip-bg) px-2 py-0.5 text-xs font-semibold">
                      {STATUS_LABELS[holding.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
