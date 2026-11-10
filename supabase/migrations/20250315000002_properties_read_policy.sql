-- supabase/migrations/20250315000002_properties_read_policy.sql
--
-- Lets signed-in users READ public.properties, so search (public.match_properties,
-- SECURITY INVOKER) returns rows to the app. Runs after
-- 20250315000001_match_properties_function.sql.
--
-- Status: NOT YET APPLIED. Paste into the Supabase SQL Editor to apply (no CLI).
-- Contains no keys, URLs, or passwords.
--
-- Why USING (true) is OK here: properties holds made-up SAMPLE listings for the search
-- demo, not sponsor data, so every signed-in user may see every row. The project rule
-- "owner-scoped policies, no USING (true)" is for sponsor data like property_listings;
-- revisit this if real listings ever go in this table.

-- Table permissions: logged-out visitors (anon) get nothing; signed-in users may only read.
-- (Supabase grants every role full access to new tables by default.)
-- The seed script uses the service role, which isn't affected.
REVOKE ALL ON public.properties FROM anon, authenticated;
GRANT SELECT ON public.properties TO authenticated;

-- RLS policy: signed-in users can read every sample property.
-- No INSERT / UPDATE / DELETE policies, so nobody can change rows through the app.
CREATE POLICY "properties_select_authenticated"
  ON public.properties
  FOR SELECT
  TO authenticated
  USING (true);
