# RLS Policy Review: `property_listings`

- **Migration:** `supabase/migrations/20250321000000_property_listings.sql`
- **Design:** `docs/data-model/property-listings-schema.md` (sections 2–4)
- **Related:** `supabase/migrations/20250321000100_sponsor_profiles.sql` (runs second), `docs/data-model-and-rls-matrix.md`, `docs/env-var-checklist.md`
- **Status (2026-10-19):** written and reviewed against the design doc; **not yet applied**. Supabase isn't provisioned, and no local Postgres was available to run it.
- **Audience:** whoever applies the migration, and reviewers checking that sponsors can only touch their own listings
- **Owner of this narrative:** Jackson Nieporte

## 1. The rule in one sentence

**A signed-in sponsor can see and change only the listings they own. Everyone else gets nothing.**

How the database enforces that:
- **Every listing records its owner** in `owner_id`. The database fills it in from the signed-in user's account when the listing is created; the browser never chooses it.
- **Every request carries the user's identity,** taken from their verified sign-in session. In SQL it's `auth.uid()`. It can't be faked by editing a value in the browser.
- **Row Level Security (RLS) is switched on.** Postgres checks every read and write against the policies below, and **anything not explicitly allowed is refused.**
- **Every policy asks the same question:** does this row's owner match the person asking (`owner_id = auth.uid()`)?

This check runs **inside the database,** so it applies however the request arrives: from the app, from the Supabase API directly, or from a script. App code can't forget it.

## 2. The policies

### At a glance

| Policy | Action | In plain words | What it stops |
|---|---|---|---|
| `listings_select_own` | Read | You see only your own listings. | Seeing anyone else's listing, even if you know its id |
| `listings_insert_own` | Create | You can only create listings that belong to you. | Creating a listing in someone else's name |
| `listings_update_own` | Edit | You can only edit your own listings, and they must still be yours afterwards. | Editing someone else's listing, or handing yours to another account |
| `listings_delete_own` | Delete | You can only delete your own listings. | Deleting anyone else's listing |
| *(no policy)* | Anything, logged out | Logged-out visitors get nothing. | Any access without signing in |

All four policies apply to signed-in users only (`TO authenticated`).

**Two words used below:**
- **`USING`** decides which **existing** rows a request can see or target.
- **`WITH CHECK`** decides what a **new or changed** row is allowed to look like before it's saved.

### `listings_select_own`: read

**In plain words:** when you ask for listings, the database hands back only the ones you own.

```sql
FOR SELECT TO authenticated
USING (owner_id = auth.uid())
```
- Other sponsors' listings are filtered out **before** anything is returned.
- Asking for another sponsor's listing by its exact id returns **nothing**, not an error. The app shows "not found", and nobody learns whether that listing exists.

### `listings_insert_own`: create

**In plain words:** a new listing is always yours. You can't create one in someone else's name.

```sql
FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid())
```
- The app doesn't send `owner_id` at all. The database fills it in with your account id.
- If a request (or a buggy line of code) tries to set someone else's id, the database **rejects** the insert.
- *(No `USING` here: a new row has nothing existing to filter.)*

### `listings_update_own`: edit

**In plain words:** you can edit only your own listings, and you can't give a listing away.

```sql
FOR UPDATE TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid())
```
- **Before the change (`USING`):** other sponsors' listings can't be targeted at all. Nothing happens to them.
- **After the change (`WITH CHECK`):** the edited listing must still be yours. Changing `owner_id` to another account is rejected, so listings can't be handed over or hijacked.
- ⚠️ It does **not** limit what you change `status` to. See risk R1 in section 6.

### `listings_delete_own`: delete

**In plain words:** you can delete only your own listings.

```sql
FOR DELETE TO authenticated
USING (owner_id = auth.uid())
```
- Other sponsors' listings are never matched, so nothing of theirs is deleted.
- *(No `WITH CHECK` here: nothing new is written.)*
- ⚠️ It allows deleting **any** of your own listings, including published ones. See risk R3.

### Deliberately missing policies

| Missing policy | Effect | Why |
|---|---|---|
| Anything for logged-out users (`anon`) | Logged-out visitors can't read or change anything | This is a private sponsor dashboard (schema doc, section 4) |
| "Anyone can read published listings" | Investors can't read listings from this table yet | RLS filters whole **rows**, not columns, so it would also expose street addresses and postal codes. See R4. |

### The one thing that ignores all of this

The **service-role key**. Supabase skips RLS entirely for it. It must only be used in server-side admin code, never in the browser or shared React components (`docs/env-var-checklist.md`). The app's normal server client (`src/lib/supabase/server.ts`) signs requests as the user, so these policies always apply to it.

## 3. Other things the migration sets up

| Item | What it does |
|---|---|
| `created_at` / `updated_at` default to `now()` | The database records when a listing was created, not the browser |
| `set_updated_at()` function + trigger | `updated_at` updates itself on every edit. The function pins its `search_path`, as Supabase's security checks recommend. |
| Index on `owner_id` | Makes "my listings" fast. Every policy filters on this column. |
| Index on `status` | Makes filtering by draft / published / archived fast |
| `CHECK (price >= 0)`, `CHECK (status IN (…))` | Rejects negative prices and made-up statuses |

## 4. How to apply the migration

Apply to a **development** Supabase project first, never production first. Both options below need the project to exist; the URL and keys then go in `.env` and Vercel, never in the repo (`docs/env-var-checklist.md`).

### Option A: Supabase CLI (recommended)

The CLI records which migrations have run, so nothing is applied twice. The project doesn't have it set up yet. Adding `npx supabase` and `supabase/config.toml` needs team approval.

```bash
npx supabase init                              # creates supabase/config.toml; keeps existing migrations
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push                           # applies migrations in filename order
```

`db push` runs `20250321000000_property_listings.sql` first, then `20250321000100_sponsor_profiles.sql`, which reuses `set_updated_at()` from the first file.

### Option B: Supabase dashboard SQL editor

Use this only if the CLI isn't approved yet.

1. Open the project → **SQL Editor** → **New query**.
2. Paste the **whole** contents of `20250321000000_property_listings.sql` and click **Run**. Expect "Success. No rows returned."
3. Repeat with `20250321000100_sponsor_profiles.sql`. **Order matters,** because the second file needs the function the first creates.
4. Run the checks in section 5.
5. **Record it.** Note the date and project in this doc. The SQL editor doesn't record the migration as applied, so if the team later adopts the CLI, run this first and `db push` won't try to apply them again:
   ```bash
   npx supabase migration repair --status applied 20250321000000
   npx supabase migration repair --status applied 20250321000100
   ```

**Either way:** paste the migration file unchanged. Don't type schema changes directly into the editor. The migration file must stay the only source of schema SQL (schema doc, section 6).

**Changing a policy later:** add a **new** migration file with a later timestamp. Never edit one that has already been applied.

## 5. Verify after applying

Run in the SQL editor. Each test block runs inside a transaction that is **rolled back**, so the update and insert attempts leave nothing behind.

**RLS is on:**
```sql
select relname, relrowsecurity from pg_class
where relname in ('property_listings', 'sponsor_profiles');   -- both: true
```

**Exactly four listing policies, none for anon:**
```sql
select policyname, cmd, roles, qual, with_check
from pg_policies where tablename = 'property_listings';        -- 4 rows, roles = {authenticated}
```

**Sponsor A can't see or take over sponsor B's listing** (replace the placeholders with two real test users' ids, and give sponsor B at least one listing first):
```sql
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"<sponsor-a-uuid>","role":"authenticated"}', true);

select count(*) from public.property_listings where owner_id = '<sponsor-b-uuid>';  -- expect 0

update public.property_listings set title = 'hijack'
where owner_id = '<sponsor-b-uuid>';                                               -- expect UPDATE 0

insert into public.property_listings (owner_id, title, address_line1, city, price)
values ('<sponsor-b-uuid>', 'x', 'x', 'x', 1);    -- expect: new row violates row-level security policy
rollback;
```

**Logged-out requests see nothing:**
```sql
begin;
set local role anon;
select count(*) from public.property_listings;   -- expect 0
rollback;
```

## 6. Risks and open questions

**Risks** (things that could go wrong with the policies as written):

| # | Risk | Impact | Mitigation / next step |
|---|---|---|---|
| R1 | **Sponsors can publish their own listings.** `listings_update_own` doesn't restrict `status`. | Contradicts the brief ("cannot publish their own listing"); unreviewed listings could go live once investors can see published listings | Proposed: `WITH CHECK (owner_id = auth.uid() AND status IN ('draft', 'archived'))`, in a **new** migration. Needs sign-off. |
| R2 | **Any signed-in account can create listings,** not only sponsors. Policies check ownership, not sponsor status. | Non-sponsor accounts can create listings owned by themselves (they still can't touch anyone else's) | Proposed: add `AND EXISTS (select 1 from sponsor_profiles where id = auth.uid())` to the insert check (matrix doc, section 4). Needs sign-off. |
| R3 | **Hard delete of any own listing,** including published ones. | A sponsor can make a live listing disappear with no record | Decide: drafts-only delete, or soft-delete (`deleted_at`) (schema doc, section 7) |
| R4 | **No investor read path.** Only owners can read listings. | The Deals page can't show real listings yet | Planned: a separate public-columns view for signed-in investors, if approved (brief open questions 2–3) |
| R5 | **Blocked edits look like success.** An UPDATE or DELETE on someone else's listing returns "0 rows", not an error. | The app could show "Saved" when nothing was saved | Server functions must treat 0 rows as **404**, and RLS check failures as **403** |
| R6 | **Service-role key leak.** It bypasses every policy here. | Full read/write of every listing | Server-only, never `VITE_`; bundle check before deploy (`docs/env-var-checklist.md`); rotate immediately if exposed |
| R7 | **Untested on a real database.** | A mistake would only show at apply time | Run section 5 on a development project before anything else uses these tables |
| R8 | **Applied via SQL editor but not recorded.** | A later `db push` re-runs the files and fails | Follow step 5 of Option B (`migration repair`) |
| R9 | **`owner_id` uses `ON DELETE RESTRICT`.** | An account that still owns listings can't be deleted | Intended; admins archive or remove listings first (schema doc, section 3) |

**Open questions** (decisions needed, with the owner to ask):

1. Approve the R1 status limit, so only admins publish? *(product)*
2. Approve the R2 sponsor-profile check on insert? *(product / security)*
3. Drafts-only delete, soft-delete, or keep hard delete (R3)? *(product)*
4. Investor read path for Deals: public-columns view now, or a later sprint (R4)? *(product)*
5. Approve the Supabase CLI and `supabase/config.toml`, so Option A can be used? *(team)*
6. Add `status DEFAULT 'draft'` to the schema doc's column table? The migration has it; the doc doesn't list a default. *(docs)*

## 7. Review checklist

- [x] RLS enabled on `property_listings`
- [x] SELECT / INSERT / UPDATE / DELETE each scoped to `owner_id = auth.uid()`
- [x] INSERT and UPDATE have `WITH CHECK`; UPDATE and DELETE have `USING`
- [x] No `USING (true)`, no anon policy, no public read policy
- [x] `owner_id` FK to `auth.users`, `ON DELETE RESTRICT`, default `auth.uid()`
- [x] Columns match `docs/data-model/property-listings-schema.md` section 2
- [ ] Applied to a development Supabase project and section 5 checks pass (R7)
- [ ] Decisions on R1–R4 recorded
