# PREIshare — Sponsor Auth and Listings Brief (Sprint 4 proposal)

- **Status:** Draft for product sign-off. Written by engineering from the repo's existing docs and code, not from a sponsor interview. Items marked *Assumption* need confirmation.
- **Date:** 2026-10-11
- **Prepared by:** Jackson Nieporte (with Claude Code)
- **Builds on:**
  - Sprint 3 dashboard shell: `docs/sprint3-handoff.md`, `docs/architecture-decisions.md`
  - Listing domain: `docs/domain/domain.md`, `docs/domain/investor-listing-domain-brief.md`
  - Listing types: `docs/decisions/ADR-001-investor-listing-types.md`, `src/types/`

## 1. Product summary

Sprint 3 delivered an investor dashboard shell with labelled sample data. This
sprint lets **sponsors**, the people or firms who bring real estate offerings
to PREIshare, **sign in and manage their own listings**: create a draft, edit
it, submit it for review, and withdraw it later. Once a listing is published,
investors see it on the **Deals** page in place of today's sample deals.

Everything that decides who someone is, what they may change, and which
listing details are private happens **on the server** (section 8).

*Terminology:* "sponsor" in this brief is the same role the domain docs call
the **lister** (`docs/domain/domain.md`) or **listing editor**
(`investor-listing-domain-brief.md`). *Assumption:* one term, "sponsor", will be
used in the UI.

## 2. Actors

| Actor | Role in this sprint | In scope to build? |
| --- | --- | --- |
| Sponsor | Signs in; creates, edits, submits, and withdraws **their own** listings | Yes: primary user |
| Investor (member) | Browses published listings on Deals (read-only) | Yes: read-only view only; investor sign-in is not part of this sprint |
| Visitor (signed out) | May see published listings, if product allows public browsing | Decision needed (Open question 2) |
| Reviewer / admin | Approves or rejects submitted listings before publication | Role exists in data; **no review screens** this sprint (*Assumption:* an admin publishes approved listings directly in Supabase) |
| System (server) | Checks sessions, validates listings, enforces status changes, records timestamps | Yes |

## 3. Goals

1. A sponsor can sign in, see only their own listings, and sign out.
2. A sponsor can turn an idea into a complete draft listing, guided by the validity rules already agreed in the domain docs.
3. Listing status always follows the closed lifecycle (`draft` → `published` → `under_offer` → `sold` → `archived`), and changes happen only through the server.
4. Investors see real published listings on Deals, without private contact details or internal notes.
5. No secret, credential, or private listing field ever reaches browser code.

## 4. Scope for this sprint

### In scope

| Area | What ships | Proposed route |
| --- | --- | --- |
| Sponsor sign-in / sign-out | Supabase Auth with a server-side session (cookie) | `/sign-in` |
| Sponsor-only area | Guarded layout; signed-out or non-sponsor users are redirected | `/sponsor` (layout) |
| My listings | Table of the sponsor's own listings, all statuses, with status badges and empty state | `/sponsor/listings` |
| Create draft | Form for the required fields; saves as `draft` | `/sponsor/listings/new` |
| Edit draft | Edit a draft the sponsor owns; read-only view for other statuses | `/sponsor/listings/$listingId` |
| Submit for review | Marks a complete draft as submitted (recorded in the `review` group); status stays `draft` until approved | (action on the edit page) |
| Withdraw | Sponsor moves their own `published` listing to `archived` | (action on the edit page) |
| Investor Deals from real data | `/dashboard/deals` reads `published` (and optionally `under_offer`) listings, read-only, replacing the MOCK deals | `/dashboard/deals` (existing) |
| Database | Supabase PostgreSQL tables for listings, contacts, and sponsor profiles; Row Level Security on every table | — |

*The routes are proposals.* Per AGENTS.md, new pages need sign-off and an
update to `docs/dashboard-ia.md` before they are built.

### Out of scope (explicit non-goals)

- **Investor sign-in** and real investor portfolio data. The `/dashboard` Home, Portfolio, and Profile pages stay on sample data.
- **Investing:** payments, subscriptions, commitments, checkout, and document e-sign.
- **Review and admin screens** (approve / reject / moderate). Publishing happens outside the app this sprint.
- **Media and document uploads** for listings.
- **Search:** pgvector or semantic search, ranking, and recommendations (`docs/architecture-decisions.md`, foundation C).
- **Messaging, notifications, and email** to sponsors or investors.
- **Lifecycle changes:** new statuses, or moving listings to `under_offer` / `sold` from the app.
- **Multi-user sponsor organisations** (teams, invites, roles inside a firm). One sign-in owns its listings.
- **CI pipeline:** a separate track (`docs/architecture-decisions.md`, foundation D).

## 5. Success criteria

- [ ] A sponsor can sign in, reach `/sponsor/listings`, and sign out. A signed-out visitor who opens any `/sponsor` URL is sent to `/sign-in`.
- [ ] A sponsor sees only their own listings. Requesting another sponsor's listing by URL returns "not found", enforced by the server and Row Level Security, not just hidden in the UI.
- [ ] A sponsor can create and edit a draft. Saving rejects invalid data with clear messages: missing title, `propertyType` not in the fixed list, an incomplete address, or a missing asking price or currency for anything beyond `draft`.
- [ ] A listing cannot reach `published` without a financial summary and at least one contact (matches `PublishedInvestorListing` in `src/types`).
- [ ] Every status change goes through a server function that checks the allowed transitions. A sponsor can withdraw (`published` → `archived`) but cannot publish their own listing.
- [ ] `/dashboard/deals` shows only `published` (and agreed `under_offer`) listings from the database. Contact emails and phones, ownership notes, and review notes are absent from the data sent to the browser.
- [ ] A search of the production client bundle finds no service-role key, database URL, or other secret (section 8).
- [ ] The responsive QA checklist passes on the new sponsor pages at 375 / 768 / 1280px, with form fields labelled and keyboard-usable.
- [ ] `npm run typecheck` and `npm run build` pass, and the Vercel deploy succeeds with secrets set as Vercel environment variables, not in the repo.

## 6. Current dashboard observations (as of `628fe42`)

Verified in the code on 2026-10-11:

| # | Observation | Why it matters this sprint |
| --- | --- | --- |
| 1 | **No sign-in exists.** `src/lib/user.ts` `getUser()` always returns `null`. The Header shows a "Demo investor" placeholder. Nothing guards `/dashboard`. | Auth starts from zero. The layout route (`src/routes/dashboard/route.tsx`) pattern can be copied for a guarded `/sponsor` layout. |
| 2 | **Deals uses a local mock shape, not the shared listing type.** `DealsList` defines its own `Deal` (`dealName`, `location`, `targetRaise`, `minimumInvestment`, status `open` / `closing_soon` / `waitlist`). The shared `InvestorListing` has `title`, `summary`, `address`, `financialSummary.askingPrice`, `contacts`, `ownership`, and status `draft` / `published` / `under_offer` / `sold` / `archived`. | The two **status lists don't match** and several fields have no counterpart, such as target raise and minimum investment. Product must decide how a published listing appears on Deals (Open question 3). |
| 3 | **Only `PropertyType` is shared.** No dashboard component imports `InvestorListing`. | Sponsor forms and the Deals mapping should use `src/types` instead of inventing a third shape. |
| 4 | **Listings have no owner link to an account.** `domain.md` lists an `ownerId`, but `InvestorListingBase` has only `ownership.ownerName` (display text). | A sponsor-owned listing needs a stable owner reference (for example `sponsorId` = the Supabase user id), which is a type change through ADR-001. |
| 5 | **Naming question still open:** `financialSummary` (types) vs `financials` (domain inventory), flagged in ADR-001. | Settle it before creating database columns. |
| 6 | **Contacts hold private data.** `InvestorContact` has `email` and optional `phone`; `Ownership` has free-text `notes`. `domain.md`: publication "must not expose private contact details or internal review notes by default." | These fields must be stripped server-side from investor-facing data (section 8). |
| 7 | **No backend packages or env setup.** `package.json` has no Supabase client; there's no `.env.example`; AGENTS.md and `.cursor/rules/preishare.mdc` still say "mock only, no Supabase". | Adding `@supabase/supabase-js` / `@supabase/ssr` and updating those rules for this sprint needs explicit team approval. |
| 8 | **Starter chrome still wraps every route** (`src/routes/__root.tsx`), so "Skip to content" is the 6th keyboard stop (verification A7, Fail). | New sponsor pages inherit the issue unless it's fixed first. |
| 9 | **No tests, lint, or CI.** Only `dev`, `build`, `preview`, `typecheck`, and `generate-routes` scripts exist. | Auth and authorization logic should get tests; choose a test tool early. |
| 10 | **Deploys run on Vercel** (Node ≥ 22.12; TanStack Start upgraded to 1.168.61 for a security fix). | Secrets go in Vercel project environment variables. Each environment (preview, production) needs its own Supabase keys. |

## 7. Data and rules carried over from the domain docs

- **Statuses (closed list):** `draft`, `published`, `under_offer`, `sold`, `archived`. No free text, no new values.
- **Property types (closed list):** `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, `land`.
- **Required for `published` and beyond:** financial summary (numeric asking price + currency code) and at least one contact with a name and email or phone.
- **Timestamps** (`createdAt`, `updatedAt`, `closedAt`) are set by the server, never sent from the browser.
- **A status is not an audit log.** Record submission, approval, and withdrawal times in the `review` / `audit` groups.

## 8. Server-only boundary

Anything in client-side code (components, page `component`s, and anything
imported by them) ends up in the browser bundle, which anyone can read.
**Route loaders also run in the browser** on client-side navigation. So the
items below must live only inside server functions (`createServerFn` handlers)
or the database, never in a component, a loader body, a shared module read at
import time, or a `VITE_` variable.

### Never in client-side code

| Category | Examples | Where it lives instead |
| --- | --- | --- |
| Admin and database credentials | Supabase **service-role key**, `DATABASE_URL` / Postgres password, JWT signing secret | `process.env` read **inside** server handlers only (never at module scope, never `VITE_`-prefixed). Set as Vercel env vars and a local `.env` (gitignored). |
| Third-party secrets | Email provider keys, any future AI/embedding API key | Same as above |
| Authorization decisions | "Is this user a sponsor?", "Does this sponsor own listing X?", "May this status change happen?" | Server functions **plus** Row Level Security. The UI may hide a button, but that is a convenience, not protection. |
| Writes | Create, update, submit, withdraw listing | Server functions that re-validate every field against `src/types` rules, whatever the browser sent |
| Status transitions and timestamps | Moving to `published` / `archived`; `createdAt`, `updatedAt`, `closedAt` | Server only; values from the browser are ignored |
| Private listing fields | Contact `email` / `phone`, `ownership.notes`, `ownershipPercent` (*Assumption:* private), review notes, rejection reasons, audit history | Returned only to the owning sponsor (and later reviewers). Investor-facing queries select public columns only. |
| Other sponsors' data | Drafts, contacts, or counts belonging to another sponsor | Filtered out by RLS before it leaves the database |
| Session tokens | Supabase access / refresh tokens | `httpOnly`, `Secure` cookies handled server-side. Not in `localStorage`, not readable by page scripts. |
| Raw database errors | SQL errors, table names, stack traces | Logged on the server; the browser gets a plain message ("Couldn't save this listing. Try again.") |

### Allowed in client-side code

- Public fields of `published` listings: title, summary, property type, city/region, asking price, and status.
- The signed-in sponsor's own non-secret profile (display name, email) returned by a server function.
- Form state while typing. The server re-checks everything on save.
- The Supabase project URL, and the public "anon/publishable" key **only if** the team explicitly decides to use the Supabase client in the browser (Open question 1). Even then, RLS must make that key safe.

## 9. Open questions

1. **Browser Supabase client or server-only access?** *Recommended:* server-only (all reads and writes through server functions), so no Supabase key ships to the browser at all.
2. **Can signed-out visitors browse published listings,** or only signed-in investors? (`domain.md` lists a "Visitor" who views published listings; the Sprint 3 brief has no public pages.)
3. **How does a listing map to a "deal" on the Deals page?** Target raise and minimum investment aren't in `InvestorListing`. Should they be added, or should Deals show asking price? What happens to the Open / Closing soon / Waitlist badges?
4. **Sign-in method:** email magic link, email + password, or OAuth? Is sponsor sign-up open, or invite-only (*Assumption:* invite-only)?
5. **Who publishes this sprint?** *Assumption:* an admin flips approved listings to `published` directly in Supabase until review screens exist.
6. **Which contact details become public** when a listing is published, if any? (`domain.md` says private by default.)
7. **Is `ownershipPercent` private** to the sponsor and reviewers?

## 10. Prompting notes for AI coding steps

Quote this brief and require:
- TypeScript, with TanStack Start file routes.
- Shared types from `src/types`.
- Server functions for every read and write of listing data.
- Row Level Security on every table.
- No secrets in client code, loaders, or `VITE_` variables.

Reject output that:
- adds anything under "Out of scope"
- trusts the browser for ownership, status, or timestamps
- reads `process.env` at module scope
