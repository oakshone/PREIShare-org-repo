-- supabase/migrations/20250321000000_sponsors_properties_rls.sql
-- Column names and policy rules match docs/data-model-and-rls-matrix.md
-- (section 1 tables, section 2 RLS matrix). NOT YET APPLIED: Supabase isn't provisioned.
-- Contains no keys, URLs, or passwords.
--
-- Matrix rows with no policy here are deliberate (RLS on + no policy = no access):
--   sponsor_profiles INSERT / DELETE -> admin only, service role, server-side
--   both tables, anon                -> logged-out users get nothing
--   both tables, service role        -> bypasses RLS; no policy applies

-- Sponsors profile linked 1:1 with auth.users
CREATE TABLE IF NOT EXISTS public.sponsor_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 120),
  company_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsor_profiles ENABLE ROW LEVEL SECURITY;

-- Matrix: sponsor_profiles | SELECT | authenticated | read only your own profile
CREATE POLICY "profiles_select_own"
  ON public.sponsor_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Matrix: sponsor_profiles | UPDATE | authenticated | edit only your own profile; can't change id
CREATE POLICY "profiles_update_own"
  ON public.sponsor_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Properties owned by a sponsor (owner_id = the sponsor's auth.users id)
CREATE TABLE IF NOT EXISTS public.property_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  address_line1 text NOT NULL,
  city text NOT NULL,
  region text,
  postal_code text,
  country text NOT NULL DEFAULT 'US',
  price numeric(12, 2) NOT NULL CHECK (price >= 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS property_listings_owner_id_idx
  ON public.property_listings (owner_id);

CREATE INDEX IF NOT EXISTS property_listings_status_idx
  ON public.property_listings (status);

ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;

-- Matrix: property_listings | SELECT | authenticated | read only listings you own
CREATE POLICY "listings_select_own"
  ON public.property_listings
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Matrix: property_listings | INSERT | authenticated | create a listing only as yourself
CREATE POLICY "listings_insert_own"
  ON public.property_listings
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Matrix: property_listings | UPDATE | authenticated | change only your own listings;
-- can't hand one to another account
CREATE POLICY "listings_update_own"
  ON public.property_listings
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Matrix: property_listings | DELETE | authenticated | delete only your own listings
CREATE POLICY "listings_delete_own"
  ON public.property_listings
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Review checklist (must all be true against your matrix):
-- [x] RLS enabled on every sponsor-owned table (sponsor_profiles, property_listings)
-- [x] No open USING (true) on sponsor/property data
-- [x] INSERT/UPDATE policies include WITH CHECK tied to auth.uid()
-- [x] Column list and FKs match docs/data-model-and-rls-matrix.md
