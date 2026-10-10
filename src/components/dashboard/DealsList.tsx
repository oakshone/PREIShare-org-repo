import { useId } from 'react'
import type { PropertyType } from '../../types'

/** Where a deal stands for new investors. */
export type DealStatus = 'open' | 'closing_soon' | 'waitlist'

export type Deal = {
  id: string
  /** Deal or offering name shown to the investor. */
  dealName: string
  /** City and state, e.g. "Austin, TX". */
  location: string
  /** Asset class, from the shared listing vocabulary. */
  propertyType: PropertyType
  /** Total amount the deal aims to raise, in US dollars. */
  targetRaise: number
  /** Smallest investment accepted, in US dollars. */
  minimumInvestment: number
  status: DealStatus
}

export type DealsListProps = {
  title?: string
  /** Deals to show; defaults to the built-in MOCK deals below. */
  deals?: Deal[]
  /** Shows the sample-data note; leave true for mock data. */
  isSampleData?: boolean
  /** Shown when `deals` is an empty list. */
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

const STATUS_LABELS: Record<DealStatus, string> = {
  open: 'Open',
  closing_soon: 'Closing soon',
  waitlist: 'Waitlist',
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

// MOCK placeholder deals — made-up offerings and amounts, not live deals.
const DEFAULT_MOCK_DEALS: Deal[] = [
  {
    id: 'd1',
    dealName: 'Sample Lakeside Townhomes',
    location: 'Austin, TX',
    propertyType: 'multifamily',
    targetRaise: 2500000,
    minimumInvestment: 25000,
    status: 'open',
  },
  {
    id: 'd2',
    dealName: 'Sample Harbor Distribution Hub',
    location: 'Tacoma, WA',
    propertyType: 'industrial',
    targetRaise: 4000000,
    minimumInvestment: 50000,
    status: 'closing_soon',
  },
  {
    id: 'd3',
    dealName: 'Sample Main Street Retail Strip',
    location: 'Boise, ID',
    propertyType: 'retail',
    targetRaise: 1200000,
    minimumInvestment: 10000,
    status: 'waitlist',
  },
]

/**
 * Open deals for the Deals page, shown as cards.
 * Presentational only: it shows the props it's given and never fetches data.
 * No invest, checkout, or subscription actions (out of scope this sprint).
 */
export function DealsList({
  title = 'Current offerings',
  deals = DEFAULT_MOCK_DEALS,
  isSampleData = true,
  emptyMessage = 'No open deals right now.',
}: DealsListProps) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
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
            Sample deals — placeholders only, not live offerings
          </p>
        ) : null}
      </div>

      {deals.length === 0 ? (
        <p className="m-0 text-sm text-(--sea-ink-soft)">{emptyMessage}</p>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
          {deals.map((deal) => (
            <li key={deal.id}>
              <article
                aria-label={deal.dealName}
                className="island-shell flex h-full flex-col gap-3 rounded-2xl p-5"
              >
                <div className="flex flex-col items-start gap-2 md:flex-row md:justify-between">
                  <h3 className="m-0 text-base font-bold text-(--sea-ink)">
                    {deal.dealName}
                  </h3>
                  <span className="shrink-0 rounded-full bg-(--chip-bg) px-2 py-0.5 text-xs font-semibold text-(--sea-ink)">
                    {STATUS_LABELS[deal.status]}
                  </span>
                </div>
                <p className="m-0 text-sm text-(--sea-ink-soft)">
                  {deal.location} · {PROPERTY_TYPE_LABELS[deal.propertyType]}
                </p>
                <dl className="m-0 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-(--sea-ink-soft)">Target raise</dt>
                    <dd className="m-0 font-semibold text-(--sea-ink)">
                      {usd.format(deal.targetRaise)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-(--sea-ink-soft)">Minimum</dt>
                    <dd className="m-0 font-semibold text-(--sea-ink)">
                      {usd.format(deal.minimumInvestment)}
                    </dd>
                  </div>
                </dl>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
