-- supabase/migrations/20250315000000_enable_pgvector_properties.sql
--
-- Implements docs/pgvector-setup-plan.md (migration goals 1–3) using the schema
-- contract in docs/embedding-data-model.md.
-- Independent of the Sprint 4 migrations: it does not touch property_listings or
-- sponsor_profiles, so its place in filename order doesn't matter (its timestamp
-- sorts before them; it was applied after them on the dev project, 2026-11-07).
--
-- Status: APPLIED to the dev project in the Supabase SQL Editor (no CLI), 2026-11-07;
-- verified: pgvector 0.8.3, embedding is vector(1536), NULL embedding allowed, <=> works, RLS on.
-- Contains no keys, URLs, or passwords.
--
-- Embedding size: 1536. The embedding model used later in app code MUST produce
-- 1536 numbers per text. Changing it means a new migration AND re-embedding
-- every row; never mix sizes in one column.

-- Step 1 — Enable pgvector so PostgreSQL can store and compare embedding vectors.
-- Safe to re-run: IF NOT EXISTS avoids errors if the extension is already on.
-- Supabase keeps extensions in its own "extensions" schema, so the type below
-- is written as extensions.vector.
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Step 2 — Properties table for PREIshare sample listings + semantic search.
CREATE TABLE IF NOT EXISTS public.properties (
  -- Primary key: a random unique id, made by Postgres.
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Listing text humans read. The embedding is built from
  -- "{title}\n\n{description}" (docs/embedding-data-model.md), so both are required.
  title text NOT NULL,
  description text NOT NULL,

  -- Optional display fields. Not part of the embedded text.
  city text,
  price numeric,

  -- Vector column: one embedding (1536 numbers) per property.
  -- NULL is allowed until the seed/backfill step fills it in; search skips NULL rows.
  -- Do not change 1536 without also changing the TypeScript embedding module.
  embedding extensions.vector(1536),

  created_at timestamptz NOT NULL DEFAULT now()
);

-- Row Level Security on, with no policies yet: nothing can read or write this
-- table through the app's normal API. You can still see it in the SQL Editor.
-- The read rule is added later, together with the search function.
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Readability aid for humans browsing the schema in Supabase.
COMMENT ON TABLE public.properties IS 'PREIshare sample investment listings; embedding powers semantic search.';
COMMENT ON COLUMN public.properties.embedding IS 'pgvector embedding of "{title}\n\n{description}"; dimension 1536; compared with cosine distance (<=>).';

-- Step 3 — Vector index: deliberately skipped (docs/pgvector-setup-plan.md,
-- "no index required for sample seed"). With tens of rows, comparing against
-- every row is instant and exact. An IVFFlat index built on an empty table can
-- also make searches skip rows, which would hide bugs during the demo.
