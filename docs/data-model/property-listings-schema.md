# Property Listings Data Model & Auth Boundaries

> Sprint 4 design doc for PREIshare. Source of truth for migrations and RLS.
> Inputs: docs/requirements/sponsor-auth-and-listings-brief.md,
>         docs/setup/supabase-env-checklist.md

## 1. Purpose

Sponsors sign in and manage **real** property listings stored in Postgres.
No mock arrays in the browser. Secrets (service-role key) never ship to the client.

- **Who:** sponsors (the brief's primary user) create, edit, and archive **their own** listings. Ownership is enforced by the database (RLS), not by hiding rows in React.
- **Replaces:** the built-in MOCK arrays in `src/components/dashboard/DealsList.tsx` (and later PortfolioTable) for listing data.
- **Status:** design only. Supabase isn't provisioned and no migration exists yet (brief section 6, observation 7).

## 2. Entity: `property_listings`

| Column | Type (Postgres) | Nullable | Notes |
|--------|-----------------|----------|-------|
| `id` | `uuid` | no | Primary key; default `gen_random_uuid()` |
| `owner_id` | `uuid` | no | FK → `auth.users(id)`; the sponsor who owns the row |
| `title` | `text` | no | Short display name |
| `description` | `text` | yes | Longer listing copy |
| `address_line1` | `text` | no | Street address |
| `city` | `text` | no | |
| `region` | `text` | yes | State / province |
| `postal_code` | `text` | yes | |
| `country` | `text` | no | Default `'US'` unless brief says otherwise |
| `price` | `numeric(12,2)` | no | Asking or share price; always >= 0 |
| `status` | `text` | no | One of: `draft`, `published`, `archived` |
| `created_at` | `timestamptz` | no | Default `now()` |
| `updated_at` | `timestamptz` | no | Default `now()`; bump on update |

**Constraints implied by the notes:**
- `check (price >= 0)`
- `check (status in ('draft', 'published', 'archived'))` (or an enum; see section 7)
- `owner_id default auth.uid()`
- An `updated_at` trigger that sets `now()` on every update

**Notes against project docs (decide before migrating):**
- **Status list:** the domain's closed lifecycle is `draft`, `published`, `under_offer`, `sold`, `archived` (`docs/domain/domain.md`, `src/types/listing-status.ts`). This sprint only needs the three above, because the brief puts `under_offer` / `sold` out of scope. Adding them later is a migration. The check must never accept free text.
- **Columns the domain docs require that this table doesn't have yet:**
  - `property_type`: one of `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, `land`. The Deals page shows it.
  - `currency`: price needs a currency code.
  - `address_line2`
  - contacts: `src/types` requires at least one for `published`.

  Each is a small addition; listed in section 7.
- **`price` NOT NULL vs drafts:** the field inventory lets drafts be incomplete. With NOT NULL, a sponsor must enter a price before the first save. Confirm, or relax to nullable and require it only when `status = 'published'`.
- **Naming vs `src/types`:** `owner_id` ↔ a new `sponsorId` field (the type has none today); `description` ↔ `summary`; `price` ↔ `financialSummary.askingPrice`. The server maps columns to the TypeScript shape.

### Indexes (recommended)
- Primary key on `id`
- Index on `owner_id` (filter "my listings")
- Optional index on `status` if dashboards filter by published/draft often

### Out of scope for this sprint
- Images / media tables
- Full-text search / pgvector embeddings (later sprint)
- Multi-sponsor shared ownership

## 3. Ownership model

- Every listing row **must** have `owner_id` set to the Supabase Auth user id of the sponsor who created it.
- `owner_id` references `auth.users(id)` with **`ON DELETE RESTRICT`**. **Decision:** an account that still owns listings can't be deleted until an admin archives or removes them. CASCADE would silently delete published listings that investors may be looking at, and soft-delete is still an open question (section 7). Revisit this if soft-delete is adopted.
- Application code never lets a client supply a different `owner_id` than the signed-in user on insert.
  - The column defaults to `auth.uid()`, so the server's insert simply omits it.
  - The `listings_insert_own` policy's `WITH CHECK (owner_id = auth.uid())` rejects any other value, even if app code has a bug.
  - `listings_update_own`'s `WITH CHECK` stops a sponsor from moving a listing to another account.

```sql
owner_id uuid not null default auth.uid() references auth.users(id) on delete restrict
```

## 4. Proposed Row Level Security (RLS) — plain language

Enable RLS on `property_listings`. No policy = no access.

| Policy name (suggested) | Command | Who | Rule |
|-------------------------|---------|-----|------|
| `listings_select_own` | SELECT | authenticated | `owner_id = auth.uid()` |
| `listings_insert_own` | INSERT | authenticated | `owner_id = auth.uid()` (WITH CHECK) |
| `listings_update_own` | UPDATE | authenticated | `owner_id = auth.uid()` (USING + WITH CHECK) |
| `listings_delete_own` | DELETE | authenticated | `owner_id = auth.uid()` |

**In plain words:**
- **See:** a signed-in sponsor sees only rows they own. Asking for anyone else's listing, even by its exact `id`, returns nothing.
- **Create:** a sponsor can only create rows owned by themselves.
- **Edit:** a sponsor can only change their own rows, and can't hand a row to someone else.
- **Delete:** a sponsor can only delete their own rows.
- **Logged out:** nothing at all.

Notes:
- Anonymous (logged-out) users get **no** listing access in this sprint.
- Do **not** add a public "read all published listings" policy unless the requirements brief explicitly asks for it.
- Service-role key bypasses RLS; it must only be used on the server for admin/maintenance tasks, never in browser code.

**Notes against the brief (decide before migrating):**
- **Sponsors could publish their own listings.** The brief says a sponsor can withdraw (`published` → `archived`) but **cannot publish** their own listing; an admin publishes. The `listings_update_own` rule as written lets an owner set any status, including `published`. Proposed tightening (needs sign-off):
  `WITH CHECK (owner_id = auth.uid() AND status IN ('draft', 'archived'))`
  Publishing then happens only through the admin path (service role, server only).
- **Investor Deals page:** the brief lists "`/dashboard/deals` reads `published` listings" as in scope. Under these rules, nobody but the owner can read a listing, so Deals can't use this table yet. Per the template, **no public read policy is added here.** If product confirms the brief item, the safe option is a separate read-only view exposing only public columns (title, city, region, price, status) to signed-in users. RLS filters rows, not columns, so a plain "read all published" policy would also expose `address_line1` and `postal_code`. See section 7.

## 5. Server vs browser operation map

| Operation | Runs where | Client type | Notes |
|-----------|------------|-------------|-------|
| Sign up / sign in / sign out | Browser + Supabase Auth | Browser (anon/public key + user session) | No service-role |
| Session check for protected routes | Server loader / middleware | Server Supabase client with user cookies/session | Redirect if no session |
| List my listings | Server loader | Server client as the user (RLS applies) | Prefer server so UI gets trusted data |
| Create listing | Server action | Server client as the user; set `owner_id` from session | Validate fields server-side |
| Update / archive listing | Server action | Server client as the user | RLS blocks cross-owner edits |
| Admin bulk jobs (out of scope) | Server only | Service-role | Never import service-role into client bundles |

**How this maps to TanStack Start in this repo:**
- **"Server action"** = a `createServerFn` handler. **"Server loader"** = a route `loader` that *calls* a server function. Loaders also run in the browser on link clicks, so the query and keys live in the server function, never in the loader body.
- **Protected routes:** the `/sponsor` layout route's `beforeLoad` calls a server function that reads the session. No session sends the user to `/sign-in`.
- **Server Supabase client:** created in a server-only file (e.g. `src/lib/supabase.server.ts`), reading `process.env` inside the handler (env checklist, section 6).
- **Server-side validation:** re-check every field and ignore any `owner_id`, `status` change to `published`, or timestamps sent by the browser.

### Environment boundary reminder
- `VITE_` / public: Supabase URL + anon (public) key only.
- Server-only: service-role key (and any DB URLs). See docs/setup/supabase-env-checklist.md.

**Note:** the first row (sign in from the browser) needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. In `.env.example` and the env checklist these are **commented out**, pending the brief's open question 1 (browser client or server-only). Adopting this template decides it as "browser client for auth". When that's confirmed:
- uncomment the two `VITE_` lines in `.env.example`
- update the checklist's "server-only access" sentence

RLS must be enabled on `property_listings` before any browser client exists. The service-role key stays server-only either way.

## 6. Acceptance checks for the next (migration) step

- [ ] Table `property_listings` matches the column list above
- [ ] `owner_id` FK to `auth.users`
- [ ] RLS enabled with own-row SELECT/INSERT/UPDATE/DELETE policies
- [ ] No policy grants world-readable access by accident
- [ ] Migration file is the only place SQL is introduced—not ad-hoc dashboard clicks without a recorded migration

Additional checks from the brief:
- [ ] Signed in as sponsor A, selecting sponsor B's listing by `id` returns zero rows (brief success criterion 2)
- [ ] An insert or update with another user's `owner_id` is rejected
- [ ] `owner_id` uses `ON DELETE RESTRICT` (section 3)
- [ ] The built browser files contain no service-role key (env checklist, section 7 bundle check)

## 7. Open questions (resolve before or during migration)

- Default `country` value if sponsors are multi-country
- Whether `status` should be a Postgres enum type vs text + check constraint
- Soft-delete (`deleted_at`) vs hard DELETE for this sprint

From the brief and domain docs:
- **Self-publishing:** adopt the tightened `listings_update_own` WITH CHECK (section 4), so only admins publish?
- **Investor read path:** how does `/dashboard/deals` read published listings: a public-columns view for signed-in users, or deferred (section 4)? Brief open questions 2 and 3.
- **Missing domain fields:** add `property_type`, `currency`, and `address_line2` now? Contacts table now or later? Published listings need at least one contact per `src/types`.
- **`price` on drafts:** NOT NULL from the first save, or required only when published?
- **Browser auth client:** confirm that sign-in from the browser (anon key) is the decision for brief open question 1, then update `.env.example` and the env checklist.
