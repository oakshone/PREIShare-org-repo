-- supabase/migrations/20250321000100_sponsor_profiles.sql
--
-- Implements sponsor_profiles from docs/data-model-and-rls-matrix.md (section 1.1, section 2).
-- Runs after 20250321000000_property_listings.sql, which creates public.set_updated_at().
--
-- Status: NOT YET APPLIED. Supabase isn't provisioned. Contains no keys, URLs, or passwords.
--
-- Matrix rows with no policy here are deliberate (RLS on + no policy = no access):
--   INSERT / DELETE -> admin only, service role, server-side (invite-only)
--   anon            -> logged-out users get nothing

-- Sponsors profile linked 1:1 with auth.users
CREATE TABLE IF NOT EXISTS public.sponsor_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 120),
  company_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER sponsor_profiles_set_updated_at
  BEFORE UPDATE ON public.sponsor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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
