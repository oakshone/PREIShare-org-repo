-- =============================================================================
-- SUPERSEDED: the real migration is
--   supabase/migrations/20250321000000_property_listings.sql (property_listings)
--   supabase/migrations/20250321000100_sponsor_profiles.sql (sponsor_profiles)
-- Edit that file (or add a new migration), not this one. Kept only as the design-review draft.
-- =============================================================================
-- DRAFT ONLY: NOT A MIGRATION, NOT APPLIED ANYWHERE.
-- Source of truth: docs/data-model-and-rls-matrix.md (tables + RLS matrix)
--                  docs/data-model/property-listings-schema.md (template design)
-- Contains no keys, URLs, or passwords. Never add any.
-- Not executed: no Postgres is available locally and Supabase isn't provisioned.
-- When approved, copy into supabase/migrations/ (needs team approval for the CLI).
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Shared trigger: keep updated_at current
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- -----------------------------------------------------------------------------
-- sponsor_profiles: one row per sponsor; id = the auth account id
-- -----------------------------------------------------------------------------
create table public.sponsor_profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  company_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger sponsor_profiles_set_updated_at
  before update on public.sponsor_profiles
  for each row execute function public.set_updated_at();

alter table public.sponsor_profiles enable row level security;

-- SELECT: only your own profile
create policy profiles_select_own on public.sponsor_profiles
  for select to authenticated
  using (id = auth.uid());

-- UPDATE: only your own profile, and id can't change
create policy profiles_update_own on public.sponsor_profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- INSERT / DELETE: intentionally no policies. Admin only, via service role on the server.
-- anon: intentionally no policies. Logged-out users see nothing.


-- -----------------------------------------------------------------------------
-- property_listings: one row per listing; owner_id = the sponsor's auth account id
-- -----------------------------------------------------------------------------
create table public.property_listings (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid()
                  references auth.users (id) on delete restrict,
  title         text not null,
  description   text,
  address_line1 text not null,
  city          text not null,
  region        text,
  postal_code   text,
  country       text not null default 'US',
  price         numeric(12, 2) not null check (price >= 0),
  status        text not null default 'draft'
                  check (status in ('draft', 'published', 'archived')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index property_listings_owner_id_idx on public.property_listings (owner_id);
create index property_listings_status_idx   on public.property_listings (status);

create trigger property_listings_set_updated_at
  before update on public.property_listings
  for each row execute function public.set_updated_at();

alter table public.property_listings enable row level security;

-- Template policies (docs/data-model/property-listings-schema.md, section 4)
create policy listings_select_own on public.property_listings
  for select to authenticated
  using (owner_id = auth.uid());

create policy listings_insert_own on public.property_listings
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy listings_update_own on public.property_listings
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy listings_delete_own on public.property_listings
  for delete to authenticated
  using (owner_id = auth.uid());

-- anon: intentionally no policies. No "read all published" policy (template rule).


-- -----------------------------------------------------------------------------
-- PROPOSED TIGHTENINGS: NEEDS SIGN-OFF (see docs/data-model-and-rls-matrix.md, section 4)
-- Each replaces the matching template policy above.
-- -----------------------------------------------------------------------------

-- (1) Only accounts with a sponsor profile can create listings.
-- drop policy listings_insert_own on public.property_listings;
-- create policy listings_insert_own on public.property_listings
--   for insert to authenticated
--   with check (
--     owner_id = auth.uid()
--     and exists (select 1 from public.sponsor_profiles p where p.id = auth.uid())
--   );

-- (2) Sponsors can't publish their own listings; only draft/archived via the app.
-- drop policy listings_update_own on public.property_listings;
-- create policy listings_update_own on public.property_listings
--   for update to authenticated
--   using (owner_id = auth.uid())
--   with check (owner_id = auth.uid() and status in ('draft', 'archived'));

-- (3) owner_id can never change after insert (belt and braces for WITH CHECK).
-- create or replace function public.lock_owner_id()
-- returns trigger language plpgsql as $$
-- begin
--   if new.owner_id is distinct from old.owner_id then
--     raise exception 'owner_id cannot be changed';
--   end if;
--   return new;
-- end;
-- $$;
-- create trigger property_listings_lock_owner_id
--   before update on public.property_listings
--   for each row execute function public.lock_owner_id();
