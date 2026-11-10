-- supabase/migrations/20250315000001_match_properties_function.sql
--
-- Similarity search over public.properties (docs/vector-search-learner-notes.md,
-- docs/pgvector-setup-plan.md). Runs after 20250315000000_enable_pgvector_properties.sql,
-- which creates the table and the vector type.
--
-- Status: NOT YET APPLIED. Paste into the Supabase SQL Editor to apply (no CLI).
-- Contains no keys, URLs, or passwords.
--
-- How a search uses it:
--   1. The server embeds the buyer's text with generatePropertyEmbedding (same model,
--      1536 numbers).
--   2. It calls match_properties(that embedding, K).
--   3. This function returns the K closest properties, best first, each with a score.

CREATE OR REPLACE FUNCTION public.match_properties(
  -- The buyer's query as an embedding. Must come from the same model as the stored
  -- embeddings (1536 numbers); a different size makes pgvector raise an error.
  query_embedding extensions.vector(1536),
  -- Top-K: how many results to return. Default 5; kept between 1 and 50.
  match_count integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  city text,
  price numeric,
  -- Score: 1 - cosine distance. Higher = closer in meaning (1 = same direction).
  -- Compare scores with each other; they are not percentages.
  similarity double precision
)
LANGUAGE sql
STABLE
-- SECURITY INVOKER: runs with the CALLER's permissions, so Row Level Security on
-- public.properties still decides which rows they can see. (SECURITY DEFINER would run
-- as the function's owner and skip RLS; never use it here.)
SECURITY INVOKER
-- Empty search_path, like public.set_updated_at(): every name below is written in full,
-- so nobody can swap in a look-alike table or operator.
SET search_path = ''
AS $$
  SELECT
    p.id,
    p.title,
    p.description,
    p.city,
    p.price,
    -- <=> is pgvector's cosine distance (smaller = closer). OPERATOR(extensions.<=>)
    -- is the same operator, written in full because search_path is empty.
    1 - (p.embedding OPERATOR(extensions.<=>) query_embedding) AS similarity
  FROM public.properties AS p
  -- Rows the seed hasn't embedded yet can't be compared, so they're skipped.
  WHERE p.embedding IS NOT NULL
  -- Best match first: smallest distance at the top.
  ORDER BY p.embedding OPERATOR(extensions.<=>) query_embedding ASC
  LIMIT least(greatest(coalesce(match_count, 5), 1), 50);
$$;

COMMENT ON FUNCTION public.match_properties(extensions.vector, integer) IS
  'Top-K properties closest to a query embedding (cosine distance, best first). SECURITY INVOKER: RLS on properties applies.';

-- Grants: only signed-in users may call it (search lives under /dashboard).
-- Postgres lets everyone (PUBLIC) run new functions, and Supabase also grants anon by
-- default, so remove both first.
REVOKE ALL ON FUNCTION public.match_properties(extensions.vector, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_properties(extensions.vector, integer) TO authenticated;

-- Note: properties has RLS on with NO policies (20250315000000). Until a read policy
-- for authenticated users is added, this function returns 0 rows to the app.
-- In the SQL Editor (which runs as the database owner) it returns real results.
