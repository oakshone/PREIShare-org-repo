// /dashboard/properties: the signed-in sponsor's own property listings (live data).
// The parent layout (src/routes/dashboard/route.tsx) already redirects signed-out visitors to /auth/login.
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '../../lib/supabase/server'

export type PropertyListItem = {
  id: string
  title: string
  city: string | null
  status: string | null
  created_at: string
}

/**
 * Server-only load path. RLS on `property_listings` (listings_select_own:
 * owner_id = auth.uid()) must restrict rows to the signed-in sponsor. The query has no owner
 * filter of its own; do not treat a React filter as the security control.
 */
const loadSponsorProperties = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ properties: PropertyListItem[]; error: string | null }> => {
    let supabase
    try {
      supabase = getSupabaseServerClient()
    } catch (configError) {
      console.error('[properties] Supabase server client not configured:', configError)
      return { properties: [], error: 'Could not load properties. Try again.' }
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw redirect({ to: '/auth/login', search: { redirect: '/dashboard/properties' } })
    }

    const { data, error } = await supabase
      .from('property_listings')
      .select('id, title, city, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[properties] Query failed:', error)
      return { properties: [], error: 'Could not load properties. Try again.' }
    }

    return { properties: data ?? [], error: null }
  },
)

export const Route = createFileRoute('/dashboard/properties/')({
  loader: () => loadSponsorProperties(),
  component: PropertiesPage,
})

function PropertiesPage() {
  const { properties, error } = Route.useLoaderData()

  return (
    <section
      aria-labelledby="dashboard-properties-heading"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2
            id="dashboard-properties-heading"
            className="display-title m-0 text-xl font-bold text-(--sea-ink)"
          >
            Your properties
          </h2>
          <p className="m-0 text-sm text-(--sea-ink-soft)">
            Listings you are allowed to manage. Visibility is enforced by the
            database (RLS), not only by this page.
          </p>
        </div>
        <Link
          to="/dashboard/properties/new"
          className="shrink-0 rounded-xl bg-(--sea-ink) px-4 py-2 text-sm font-semibold text-white no-underline"
        >
          Add property
        </Link>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-(--danger) px-4 py-3 text-sm font-semibold text-(--danger)"
        >
          {error}
        </div>
      ) : null}

      {!error && properties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--line) px-4 py-8 text-center text-(--sea-ink-soft)">
          <p className="m-0 font-semibold text-(--sea-ink)">No properties yet</p>
          <p className="m-0 mt-1 text-sm">
            When you add a listing, it will show up here for your sponsor
            account only.
          </p>
        </div>
      ) : null}

      {properties.length > 0 ? (
        <ul className="m-0 list-none divide-y divide-(--line) rounded-xl border border-(--line) p-0">
          {properties.map((property) => (
            <li
              key={property.id}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="m-0 font-semibold text-(--sea-ink)">{property.title}</p>
                <p className="m-0 text-sm text-(--sea-ink-soft)">
                  {property.city ?? 'Location TBD'}
                </p>
              </div>
              <span className="text-xs uppercase tracking-wide text-(--sea-ink-soft)">
                {property.status ?? 'unknown'}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
