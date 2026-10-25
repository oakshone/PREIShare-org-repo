// src/routes/dashboard/listings/index.tsx
// List page under the protected dashboard (the guard in ../route.tsx redirects signed-out
// visitors). Loads through the listMyListings server function: session check, server client,
// RLS. No mock data.
import { createFileRoute, Link } from '@tanstack/react-router'
import { ListingCard } from '../../../components/listings/ListingCard'
import { listMyListings } from '../../../server/listings'

export const Route = createFileRoute('/dashboard/listings/')({
  loader: () => listMyListings(),
  component: ListingsIndexPage,
})

const addLinkClass =
  'shrink-0 rounded-xl bg-(--sea-ink) px-4 py-2 text-sm font-semibold text-white no-underline'

function ListingsIndexPage() {
  const result = Route.useLoaderData()

  return (
    <section aria-labelledby="listings-heading" className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="listings-heading" className="display-title m-0 text-xl font-bold text-(--sea-ink)">
          Your property listings
        </h2>
        {result.ok && result.listings.length > 0 ? (
          <Link to="/dashboard/listings/new" className={addLinkClass}>
            Add listing
          </Link>
        ) : null}
      </div>

      {!result.ok ? (
        <p
          role="alert"
          className="m-0 rounded-xl border border-(--danger) px-4 py-3 text-sm font-semibold text-(--danger)"
        >
          {result.error}
        </p>
      ) : result.listings.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-(--line) p-6">
          <p className="m-0 text-sm text-(--sea-ink-soft)">
            No properties yet. Add your first listing to get started.
          </p>
          <Link to="/dashboard/listings/new" className={addLinkClass}>
            Add listing
          </Link>
        </div>
      ) : (
        <ul className="dash-grid-cards">
          {result.listings.map((listing) => (
            <li key={listing.id}>
              <ListingCard listing={listing} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
