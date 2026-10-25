# Sprint 4 Handoff — Sponsor Auth & Postgres Property Listings

**Project:** PREIshare dashboard  
**Sprint:** 4 — Supabase auth & database  
**Audience:** Sponsors and the next-sprint implementer  
**Status date:** 2026-10-25

## 1. Client story recap
PREIshare sponsors need a secure way to sign in and manage real property listings—not mock data in the browser—while secret keys stay out of the client bundle.

## 2. Delivered vs original request
| Client need | Delivered? | Where / evidence |
| --- | --- | --- |
| Secure sponsor login | Yes | Sign-up `/auth/signup`, sign-in `/auth/login` (Supabase Auth, email + password). Every `/dashboard` page is guarded by a server-side session check in `src/routes/dashboard/route.tsx`; sign-out runs on the server. Checklist 2.1–2.4 PASS |
| Postgres-backed listings (create/read/display) | Partial | Create and read: yes. `/dashboard/listings` loads via `listMyListings`, `/dashboard/listings/new` saves via `createListing` (`src/server/listings.ts`), and the new row matches the Supabase Table Editor (checklist 3.1–3.4 PASS). No edit or delete screens yet |
| Row-level security so sponsors only see allowed rows | Yes | RLS on `property_listings` (`supabase/migrations/20250321000000_property_listings.sql`; review in `docs/data-model/rls-policy-review.md`): owner-only select / insert / update / delete, nothing for logged-out users. A second sponsor can't see the first's listings (checklist 1.2, 1.3, 4.1–4.4 PASS) |
| Secrets kept out of the client bundle | Yes | `.env.example` holds names only; `.env` never committed; the browser bundle contains only the public URL and publishable key; the service-role key is unused (checklist 5.1–5.5 PASS) |

**Gaps** (from `docs/verification/sprint4-auth-listings-checklist.md`): every check row passed and none failed. Not inspected: the browser Network tab (5.5 passed on the bundle check only), the live `pg_policies` list (1.3 compared against the migration file), and Vercel's environment variables. The "Saving…" network-failure message was not re-tested. Beyond the checklist, two brief items aren't delivered: sponsors can't edit, submit, or withdraw listings in the UI, and investors don't see real listings on Deals yet.

## 3. Architecture decisions (keep short)
- **Auth:** Supabase Auth with email + password and open sign-up (email confirmation on). The session lives in cookies; the `/dashboard` layout checks it on the server with `auth.getUser()` (verified, not just read) through `getSessionUser()` in `src/lib/auth/session.ts`.
- **Data:** PostgreSQL `property_listings` per `docs/data-model/property-listings-schema.md`: `owner_id` → `auth.users`, title, description, address fields, `price numeric(12,2) ≥ 0`, `status` (`draft` / `published` / `archived`, default `draft`), timestamps. Schema changes only as migrations; `src/lib/supabase/types.ts` mirrors them.
- **Authorization:** RLS policies compare `owner_id = auth.uid()` on every request. The browser only signs in and signs up; all listing reads and writes go through server functions (`src/server/listings.ts`) that check the session, validate input (zod), and set the owner from the session. RLS is the final lock either way.
- **Clients:** `src/lib/supabase/server.ts` is **server-only** (stripped from the browser bundle) and acts as the signed-in user with the publishable key + the user's cookie, so RLS applies; it holds **no** secret key. `src/lib/supabase/client.ts` uses the public URL + publishable key only, for sign-in and sign-up. The service-role key is not used anywhere.
- **Env hygiene:** Public (`VITE_`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Server-only: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and the secrets `SUPABASE_SERVICE_ROLE_KEY` (left empty) and `DATABASE_URL` (unused). Real values only in a local `.env` (gitignored) and Vercel; never committed.

## 4. How to run locally (sponsor-friendly)
1. Copy `.env.example` → `.env` and fill values from the Supabase project (see `docs/setup/supabase-env-checklist.md`): the project URL and the **publishable** key, each in both the plain and the `VITE_` line. Leave `SUPABASE_SERVICE_ROLE_KEY` empty.
2. Apply migrations / confirm RLS is enabled for listings: in the Supabase SQL Editor, run `supabase/migrations/20250321000000_property_listings.sql`, then `20250321000100_sponsor_profiles.sql` (only needed once per project).
3. Install deps and start the TanStack Start dev server: `npm install`, then `npm run dev`, and open <http://localhost:3000>.
4. Sign up / log in as a test sponsor → open dashboard listings → create one listing → confirm it reloads from Postgres: sign up at `/auth/signup` and confirm the email, sign in at `/auth/login`, open **Listings**, click **Add listing**, save, then refresh the page and check the listing is still there (and in the Supabase Table Editor).

## 5. Known limitations
- **Listing fields are still minimal:** no property type, currency, contacts, or second address line.
- **No edit or delete screens.** An owner-scoped `updateListing` server function exists but has no page yet.
- **No approval workflow:** sponsors can set their own listing to `published` (risk R1, left open by decision), and there's no submit / approve / reject flow.
- **Open sign-up:** any new account can create listings; nothing checks that it belongs to a sponsor (risk R2).
- **Hard delete:** through the Supabase API, a sponsor can permanently delete their own listings, including published ones (risk R3).
- **Investors don't see real listings:** the Deals page still shows labelled sample data.
- **No password reset page, and Supabase's default (unbranded) emails.**
- **No search** (full-text or vector).
- **No friendly "page not found"**, and old links (`/login`, `/dashboard/properties`) don't redirect.
- **Checklist items skipped:** browser Network tab, live `pg_policies` list, Vercel variables, and the "Saving…" network-failure re-test. No checklist item failed.

## 6. Recommended next-sprint work (pick with stakeholders)
1. **Richer listing fields** — more columns, validation, and edit/delete flows on top of the current schema.
   *Depends on current auth + RLS:* new columns arrive by migration on `property_listings`, so the existing owner-only policies cover them with no change. The edit page reuses `ListingForm` and the existing `updateListing`, which already treats "0 rows" as "not found". Delete should follow the same server-function pattern.
2. **Approvals workflow** — draft → submit → approve/reject states and who may transition them (RLS + UI).
   *Depends on current auth + RLS:* starts by tightening the existing update policy so sponsors can only set `draft` or `archived` (closes R1). Approve/reject needs an admin path kept on the server (a separate server-only module); the service-role key must never reach the browser.
3. **pgvector search** — embeddings + similarity search for listings once core CRUD and auth are stable.
   *Depends on current auth + RLS:* search must run through server functions and respect the same RLS (sponsors search only their own listings; any investor search needs a public-columns view first). Embedding API keys would be new server-only secrets, never `VITE_`.

None of these replaces the current split: browser sign-in only, all data through server functions, RLS on every table, secrets server-side.

## 7. Open questions for stakeholders
- Who may create vs only view listings? (Today any signed-in account can create; investors can't view any yet.)
- Is multi-sponsor isolation required in the next sprint? (Each sponsor already sees only their own listings. Should sign-up be invite-only, or limited to approved sponsors?)
- Preferred next theme: richer fields, approvals, or search?
- Who may publish a listing: the sponsor, or only an admin after review?

## 8. Source artifacts
- docs/requirements/sponsor-auth-and-listings-brief.md
- docs/verification/sprint4-auth-listings-checklist.md
- docs/data-model/property-listings-schema.md
- docs/setup/supabase-env-checklist.md
