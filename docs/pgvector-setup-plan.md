# PREIshare pgvector setup plan

## Purpose
Enable semantic property search storage in Supabase PostgreSQL using pgvector,
aligned with `docs/embedding-data-model.md`. This plan is the contract for the
SQL migration step—no application search UI work here.

## Source of truth
- Data model doc: `docs/embedding-data-model.md`
- Table (from model): `properties`
- Embedding column (from model): `embedding`
- Embedding dimension (from model): `DIMENSION_TODO` (the model isn't chosen yet; replace with the real number everywhere in one pass, as the data model says)
- Distance / ranking style for demo: cosine-style similarity, standardized on
  pgvector's **cosine distance operator `<=>`** (smaller = closer; sort
  ascending; show similarity as `1 - distance` if a score is displayed)

## Migration goals (what “done” means)
1. pgvector extension is available in the database.
2. `properties` table exists with listing fields from the data model plus a
   non-lossy vector column with the fixed dimension above.
3. It is valid for `embedding` to be null until a backfill/seed job runs.
4. A beginner demo can run a similarity query later. The search function
   (`match_properties`-style) is a **follow-up migration** and out of scope here.
5. Verification queries prove extension + table + vector column shape.

## Safe migration order (must not be reordered)
| Order | Step | Why this order |
|------:|------|----------------|
| 1 | Enable extension `vector` (pgvector) | Vector column types and operators do not exist until the extension is on. |
| 2 | Create `properties` table (or alter if it already exists) including `embedding vector(DIMENSION_TODO)` and other model columns | Table/column creation depends on the extension. |
| 3 | (Optional for tiny demos) Add a vector index | Indexes are not required to store vectors; add only after the column exists. For very small sample data, sequential scan is OK. **This plan: skipped (no index).** |
| 4 | Run verification SQL | Confirms the schema before any seed or app code. |

**Do not** create vector columns before enabling the extension.  
**Do not** invent a second dimension or a second embedding column name.

**Project notes (from `AGENTS.md`):**
- Each step is a **new** migration file in `supabase/migrations/` with a later timestamp than the existing ones; never edit an applied migration.
- The project has no Supabase CLI, so migrations are applied by pasting them into the Supabase **SQL Editor**, in filename order.
- `properties` gets `ENABLE ROW LEVEL SECURITY` in the same migration that creates it.
- `src/lib/supabase/types.ts` is updated in the same change as the table migration.
- Supabase puts extensions in its `extensions` schema. Our existing `set_updated_at()` function pins `search_path = ''`, so any later function that uses vectors must write the type as `extensions.vector`.

## Similarity approach (beginner demo)
- **Choice:** Use cosine-style similarity ranking consistently in later search SQL:
  distance via `<=>`, matching `docs/embedding-data-model.md` and
  `docs/vector-search-learner-notes.md`.
- **Why:** Buyers care about “meaning closeness,” and cosine-style scoring is a
  common default for text embeddings.
- **Tradeoff:** Exact scans over a handful of sample rows are simple and fine for
  learning. Approximate indexes help at larger scale but add setup complexity;
  for this tutorial’s sample set, correctness and clear SQL matter more than
  micro-optimization.

## Index recommendation
- **Demo scale (tens of rows):** Index optional; document “no index required for sample seed.”
  **Decision: no index required for sample seed.**
- **If adding an index anyway:** Create it only after the embedding column exists;
  note that many rows should be non-null before the index is useful; keep the
  plan’s dimension and distance style aligned with index operator class when
  you add one in a later change.

## Environment values (high level—no secrets in this file)
List names only; real values live in local env / Supabase dashboard:
- `SUPABASE_URL` — project API URL
- `SUPABASE_SERVICE_ROLE_KEY` or a migration-friendly DB URL — used by trusted
  server/seed paths (never expose service role to the browser)
- `DATABASE_URL` or Supabase DB connection string — if migrations run via CLI
- Embedding provider API key name (e.g. `OPENAI_API_KEY`) — needed when
  generating vectors later, not required to enable pgvector itself

**For this project:**
- Enabling pgvector and creating the table need **no** env values: it's done in the SQL Editor.
- `SUPABASE_SERVICE_ROLE_KEY` stays empty unless the seed/backfill step needs it, and then only in a server-only `*.server.ts` module.
- `DATABASE_URL` stays unused (no CLI).
- The embedding API key name is decided with the model. It is a secret: never `VITE_`. Adding it means adding the name to `.env.example` (empty), `docs/env-var-checklist.md` and `src/env.d.ts`.

## Verification queries (run after migration)
Write the intent of each check (agent may refine exact SQL in the next step):
1. Show that extension `vector` is installed.
2. Describe `properties` and confirm `embedding` is type `vector` with the
   planned dimension.
3. Insert or select a row with a null embedding to prove nulls are allowed.
4. (Optional) Compare two literal vectors with the chosen distance operator to
   prove pgvector operators work.

Example sketch (illustrative—match your dimension):
```sql
-- 1) extension present
select * from pg_extension where extname = 'vector';

-- 2) column shape (Supabase SQL editor)
select column_name, data_type, udt_name
from information_schema.columns
where table_name = 'properties';

-- 4) operator smoke test (dimension must match)
-- select '[1,2,3]'::vector(3) <=> '[1,2,4]'::vector(3) as distance;
```

## Out of scope for this migration plan
- Generating real embeddings for listings (later module/seed steps)
- Search API routes and React UI
- Production RLS policies hardening beyond what the model already requires
- Hybrid keyword + vector ranking, filters, or re-ranking

## Handoff to next step
The coding agent must implement **only** ordered goals 1–2 (and 3 if this plan
marks index as in-scope), using names and dimension from the data model doc,
and must not silently change vector size or table name.
