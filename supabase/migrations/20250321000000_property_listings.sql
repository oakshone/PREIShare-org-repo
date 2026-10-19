-- supabase/migrations/20250321000000_property_listings.sql
--
-- Implements docs/data-model/property-listings-schema.md (sections 2-4).
-- Policy-by-policy explanation and how to apply: docs/data-model/rls-policy-review.md
--
-- Status: NOT YET APPLIED. Supabase isn't provisioned. Contains no keys, URLs, or passwords.
--
-- Access summary:
--   - A signed-in sponsor can SELECT / INSERT / UPDATE / DELETE only rows they own
--     (owner_id = auth.uid()).
--   - Logged-out (anon) requests get nothing: no policy targets anon.
--   - The service role bypasses RLS and is used only by server-side admin jobs.

-- ---------------------------------------------------------------------------
-- Shared trigger function: set updated_at = now() on every update.
-- (Also used by later migrations, e.g. 20250321000100_sponsor_profiles.sql.)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Table (schema doc, section 2)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.property_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Owner = the signed-in sponsor's auth account. Filled in by the database, never by the
  -- browser. RESTRICT: an account that still owns listings can't be deleted (schema doc, section 3).
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

-- ---------------------------------------------------------------------------
-- Indexes (schema doc, section 2: "Indexes (recommended)")
-- ---------------------------------------------------------------------------
-- "My listings": every policy filters on owner_id, so this index serves all of them.
CREATE INDEX IF NOT EXISTS property_listings_owner_id_idx
  ON public.property_listings (owner_id);

-- Dashboards filtering by draft / published / archived.
CREATE INDEX IF NOT EXISTS property_listings_status_idx
  ON public.property_listings (status);

-- ---------------------------------------------------------------------------
-- Timestamps: created_at / updated_at default to now(); updated_at bumps on update.
-- ---------------------------------------------------------------------------
CREATE TRIGGER property_listings_set_updated_at
  BEFORE UPDATE ON public.property_listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security (schema doc, section 4). With RLS on, no matching policy = no access.
-- ---------------------------------------------------------------------------
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;

-- Read: only listings you own.
CREATE POLICY "listings_select_own"
  ON public.property_listings
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Create: only listings owned by yourself.
CREATE POLICY "listings_insert_own"
  ON public.property_listings
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Edit: only your own listings, and they must still be yours afterwards.
CREATE POLICY "listings_update_own"
  ON public.property_listings
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Delete: only your own listings.
CREATE POLICY "listings_delete_own"
  ON public.property_listings
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Intentionally absent:
--   - any policy for anon (logged-out users get nothing)
--   - any "read all published listings" policy (schema doc, section 4)
-- Proposed but NOT approved (schema doc, section 7); add in a later migration if signed off:
--   - listings_update_own WITH CHECK (... AND status IN ('draft', 'archived')) so only admins publish
