import { useId } from 'react'

/** Kind of investor, shown as a small tag. */
export type InvestorType = 'individual' | 'accredited' | 'institutional'

/** How the investor prefers to be contacted. */
export type PreferredContact = 'email' | 'phone'

export type InvestorProfile = {
  displayName: string
  email: string
  investorType: InvestorType
  preferredContact: PreferredContact
  /** Optional short bio or notes line. */
  bio?: string
}

export type ProfileCardProps = {
  /** Profile to show; defaults to the built-in MOCK profile below. */
  profile?: InvestorProfile
  /** Shows the sample-data note; leave true for mock data. */
  isSampleData?: boolean
}

const INVESTOR_TYPE_LABELS: Record<InvestorType, string> = {
  individual: 'Individual investor',
  accredited: 'Accredited investor',
  institutional: 'Institutional investor',
}

const CONTACT_LABELS: Record<PreferredContact, string> = {
  email: 'Email',
  phone: 'Phone',
}

// MOCK placeholder profile — made-up member details, not a real account.
// The name matches the Header's "Demo investor" placeholder; example.com is reserved for examples.
const DEFAULT_MOCK_PROFILE: InvestorProfile = {
  displayName: 'Demo investor',
  email: 'demo.investor@example.com',
  investorType: 'accredited',
  preferredContact: 'email',
  bio: 'Interested in multifamily and industrial offerings with a 5–7 year hold.',
}

/**
 * Read-only member profile for the Profile page.
 * Presentational only: it shows the props it's given and never fetches data.
 * No sign-in, editing, or password actions (out of scope this sprint).
 */
export function ProfileCard({
  profile = DEFAULT_MOCK_PROFILE,
  isSampleData = true,
}: ProfileCardProps) {
  const headingId = useId()
  const initial = profile.displayName.trim().charAt(0).toUpperCase() || '?'

  return (
    <section
      aria-labelledby={headingId}
      className="island-shell flex max-w-xl flex-col gap-4 rounded-2xl p-5"
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-dashed border-(--line) bg-(--chip-bg) text-xl font-bold text-(--sea-ink-soft)"
        >
          {initial}
        </span>
        <div className="min-w-0">
          <h2
            id={headingId}
            className="display-title m-0 text-xl font-bold text-(--sea-ink)"
          >
            {profile.displayName}
          </h2>
          <p className="m-0 mt-1">
            <span className="rounded-full bg-(--chip-bg) px-2 py-0.5 text-xs font-semibold text-(--sea-ink)">
              {INVESTOR_TYPE_LABELS[profile.investorType]}
            </span>
          </p>
        </div>
      </div>

      {isSampleData ? (
        <p
          role="note"
          className="m-0 rounded-xl border border-(--line) bg-(--chip-bg) px-3 py-2 text-xs font-semibold text-(--sea-ink-soft)"
        >
          Sample profile — placeholder details, not a real account
        </p>
      ) : null}

      <dl className="m-0 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <dt className="text-xs text-(--sea-ink-soft)">Email</dt>
          <dd className="m-0 font-semibold text-(--sea-ink)">{profile.email}</dd>
        </div>
        <div>
          <dt className="text-xs text-(--sea-ink-soft)">Preferred contact</dt>
          <dd className="m-0 font-semibold text-(--sea-ink)">
            {CONTACT_LABELS[profile.preferredContact]}
          </dd>
        </div>
        <div className="md:col-span-2">
          <dt className="text-xs text-(--sea-ink-soft)">Notes</dt>
          <dd className="m-0 text-(--sea-ink)">
            {profile.bio ?? (
              <span className="text-(--sea-ink-soft)">No notes added yet.</span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  )
}
