// src/components/listings/ListingCard.tsx
// Presentational card for one listing — props in, no secret env, no direct DB access.
import type { ListingRow } from '../../server/listings'

export type ListingCardProps = {
  listing: Pick<ListingRow, 'id' | 'title' | 'city' | 'status'>
}

const STATUS_LABELS: Record<ListingCardProps['listing']['status'], string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <article
      aria-label={listing.title}
      className="island-shell flex h-full flex-col gap-2 rounded-2xl p-5"
    >
      <h3 className="m-0 text-base font-bold text-(--sea-ink)">{listing.title}</h3>
      <p className="m-0 text-sm text-(--sea-ink-soft)">{listing.city}</p>
      <p className="m-0 text-sm text-(--sea-ink-soft)">
        Status:{' '}
        <span className="rounded-full bg-(--chip-bg) px-2 py-0.5 text-xs font-semibold text-(--sea-ink)">
          {STATUS_LABELS[listing.status]}
        </span>
      </p>
    </article>
  )
}
