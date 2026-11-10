# PREIshare semantic search — handoff

**Date:** 2026-11-10
**Audience:** the next implementer, and the PREIshare operator who will demo it
**Status:** built, verified, signed off as demo-ready (with one stated weakness)

**Sources this handoff is built from:**
- `docs/semantic-search-requirements.md` (client story, example queries, scope)
- `docs/embedding-data-model.md` (schema contract)
- `docs/pgvector-setup-plan.md` (migration plan, metric, index choice)
- `docs/semantic-search-verification.md` (test results and sign-off)

## 1. Client story recap

PREIshare buyers describe what they want in everyday words, for example *"quiet cabin near water
with good rental upside"*. Keyword search misses listings that say the same thing differently,
like *"lakefront retreat with steady bookings"*. This slice turns listing text into embeddings,
stores them in Supabase Postgres with pgvector, and ranks sample listings by closeness of meaning
(requirements brief, "Problem").

## 2. Delivered vs requested

Every in-scope item from the requirements brief, with where it lives:

| In scope (requirements brief) | Delivered? | Where / evidence |
| --- | --- | --- |
| Plain-language understanding of embeddings and vector similarity | Yes | `docs/embeddings-learner-notes.md`, `docs/vector-search-learner-notes.md`, cheat sheet "Semantic search" section |
| Data model for properties + embedding vectors | Yes | `docs/embedding-data-model.md`: `properties` (`id`, `title`, `description`, `city`, `price`, `embedding vector(1536)`, `created_at`) |
| Migration to enable pgvector and store vectors | Yes | `supabase/migrations/20250315000000_enable_pgvector_properties.sql`. Applied 2026-11-07; verified: pgvector 0.8.3, `vector(1536)`, NULL allowed, `<=>` works, RLS on |
| TypeScript helper to generate embeddings | Yes | `src/lib/embeddings/generate.ts` (`generatePropertyEmbedding`, `generateQueryEmbedding`), types in `src/lib/embeddings/types.ts` |
| Seed/backfill path for a small sample set | Yes | `data/sample-properties.json` (10 listings) + `scripts/seed-property-embeddings.ts`. Verified: 10 rows, 0 null embeddings, all 1536; re-run gives `0 inserted, 10 skipped` |
| Similarity search SQL + TypeScript helper | Yes | `match_properties` in `supabase/migrations/20250315000001_match_properties_function.sql`; `searchProperties` in `src/lib/property-search.ts` |
| Minimal API route and simple React search page | Yes | `GET /api/properties/search` (`src/routes/api/properties/search.ts`); page `/search` (`src/routes/search.tsx`) |
| End-to-end verification notes and handoff doc | Yes | `docs/semantic-search-verification.md`; this file |

**Success criteria (requirements brief):** all five met, plus the control-query behaviour. The
evidence is in the verification report's "Requirements traceability" table.

## 3. Decisions made (the brief's open questions, answered)

| Open question (where it was asked) | Decision | Why |
| --- | --- | --- |
| Embedding provider (requirements, data model) | OpenAI `text-embedding-3-small` | Outputs exactly 1536 numbers. The templates only gave it as an example; the real rule is "must output 1536" |
| Vector dimension (requirements, data model) | **1536** everywhere | Set by the migration template; the same in the migration, `src/lib/embeddings/types.ts`, `src/lib/supabase/types.ts` and both planning docs. `node src/lib/embeddings/self-check.ts` checks they agree |
| Distance metric (requirements, data model, plan) | Cosine distance `<=>`, sorted smallest first; shown as `similarity = 1 − distance` | Usual choice for text embeddings (plan, "Similarity approach") |
| Index (plan) | None | 10 rows: an exact scan is instant and easy to check. An IVFFlat index on an empty table could also skip rows |
| How many sample listings (requirements) | 10 | 3 water getaways, 2 family homes, 2 city units, 2 keyword-only distractors, 1 warehouse; no farmland, so the control query has nothing strong to match |
| Separate demo table or `property_listings` (requirements, data model) | Separate table, `properties` | `property_listings` rows are owner-only (risk R4), so a buyer's search couldn't see them. Keeps Sprint 4 untouched |
| Where the search page lives (requirements) | Its own page, `/search` (template path) | Not in the dashboard nav yet |
| Who can read search data | Signed-in users only, read-only | `20250315000002_properties_read_policy.sql`. `USING (true)` is acceptable only because the rows are sample data |

## 4. How it works

```text
/search page ──GET /api/properties/search?q=…──▶ API route (checks q, limit, sign-in)
                                                   │
                                                   ▼
                                    searchProperties (src/lib/property-search.ts)
                                       │                         │
                     generateQueryEmbedding                match_properties(query_embedding, K)
                     (OpenAI, 1536 numbers)                (Postgres, <=>, best first, as the user → RLS)
                                                   │
                                                   ▼
                     JSON { query, limit, results: [{ id, title, description, city, price, similarity }] }
```

**Safety choices:**
- **Keys:** the OpenAI key and the service-role key are server-only. The browser bundle was checked:
  no key names, no OpenAI address, no search server code.
- **`match_properties`:**
  - It is `SECURITY INVOKER`, so RLS applies.
  - It uses `SET search_path = ''` with every name written in full.
  - It may only be called by `authenticated` (`PUBLIC` and `anon` revoked).
- **Sign-in on the API route:** the route checks sign-in itself, because the `/dashboard` guard
  doesn't cover `/api/…` or `/search`. Without that check, strangers could spend OpenAI credit.
- **The page:** it shows results in the server's order, with the server's score. There is no
  client-side re-ranking or score maths.

## 5. How to run it locally

1. **`.env`** (names only; see `.env.example` and `docs/env-var-checklist.md`):
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY` and the two `VITE_` lines (from Sprint 4)
   - `OPENAI_API_KEY` (paid OpenAI account)
   - `SUPABASE_SERVICE_ROLE_KEY` (only for the seed script)
2. **Apply the migrations** in the Supabase SQL Editor (there is no CLI), in this order:
   1. `20250315000000_enable_pgvector_properties.sql`
   2. `20250315000001_match_properties_function.sql`
   3. `20250315000002_properties_read_policy.sql`
3. **Optional free check:** `node src/lib/embeddings/self-check.ts` should print `All checks passed.`
4. **Seed:** `node --env-file=.env scripts/seed-property-embeddings.ts` should print
   `Done: 10 inserted, 0 skipped, 0 failed.` A re-run skips existing titles.
5. **Search:**
   1. Run `npm run dev` and sign in at `/auth/login`.
   2. Open `http://localhost:3000/search`.
   3. Search *"quiet cabin near water with good rental upside"*. Lakefront cabin should come first (≈ 0.669).

## 6. Verified results (from `docs/semantic-search-verification.md`)

| Query (requirements brief) | Top result | Notes |
| --- | --- | --- |
| 1. quiet cabin near water with good rental upside | Lakefront cabin 0.669 | #2 Woodland retreat (0.606) shares none of "quiet", "cabin", "water" |
| 2. family-friendly home close to good schools | Family home on a cul-de-sac 0.693 | Both family homes on top, then a drop to 0.335 |
| 3. downtown condo walkable to restaurants | Downtown condo 0.729 | Top 3 all city listings |
| 4. control: large farmland acreage for crops | Industrial warehouse 0.317 | No strong match, as required |

**Edge cases:**
- An empty query gets a 400 with a clear message.
- Nonsense text gets the lowest scores (about 0.11–0.16).
- "cabin" on its own gives stable results.
- Signed out gets a 401, which the page shows as a sign-in prompt.
- Methods other than GET get a 405.

## 7. Known limitations (stated in the demo)

- **Keyword-trap check failed (accepted 2026-11-10):**
  - *"sunny walkable condo near transit"* ranks the trap *"Sunny hilltop cabin"* (0.513) above the
    intended *"Bright urban unit"* (0.483).
  - In query 1, two distractors outrank *"Riverside cottage"*.
  - Shared words still pull embeddings closer. It's a data/model effect, not a code bug, and was
    left as is on purpose (verification report, "Refine cycle").
- **Scores are raw:**
  - The best real matches reach about 0.6–0.73, not 1.0.
  - Never present them as percentages.
  - There is no cut-off yet, so top-K always returns 5 results, even for nonsense.
- **Sample data only:** search covers the separate `properties` table, not sponsors' real
  `property_listings`.
- **No automatic re-embedding:** editing a listing's text doesn't update its embedding. The seed
  is run by hand, with the admin (service-role) key.
- **Out of scope by design (requirements brief):** filters (price, beds), map search, hybrid
  keyword + vector ranking, a vector index, and production embedding jobs.
- **`/search` placement:** not in the dashboard nav, and not behind the dashboard guard (the API
  checks sign-in).

## 8. Doc drift to fix

- `docs/pgvector-setup-plan.md` says the service-role key would be used "only in a server-only
  `*.server.ts` module". The seed actually uses it in `scripts/seed-property-embeddings.ts`: a
  dev-only script that nothing in the app imports, run by hand, so it can't reach the browser.
  Update the plan's wording to match.
- The two newer migrations' header comments still say "NOT YET APPLIED". Both are applied and
  verified (2026-11-10).
- `docs/embedding-data-model.md` still lists the provider, metric, sample count and table as open
  questions. Answers are in section 3 above.
- The data model's "Consistency checklist" boxes are unticked.

## 9. Recommended next steps

1. **Make the scores stakeholder-friendly.** Run more test queries, then pick a minimum score and
   plain labels (strong / possible / weak), so weak and nonsense results are hidden.
2. **Fix the keyword trap, if the demo needs it.** Give the short sample descriptions more meaning
   first (verification report, "Refine cycle"); only then consider a larger model, which would be
   3072 numbers: a new migration and a re-embed.
3. **Search real listings.** This depends on Sprint 4 risk R4: a column-safe read path for
   investors (no street addresses) and a policy that isn't `USING (true)`. It would also need
   re-embedding whenever a sponsor edits a listing.
4. **Placement.** Decide whether `/search` joins the dashboard nav or becomes a search box on the
   Deals page (`docs/architecture-decisions.md`, foundation C).

## 10. Open questions for stakeholders

- Should search cover **real** sponsor listings, and which fields may investors see?
- Is the keyword-trap weakness acceptable for launch, or must it pass first?
- Who can search: any signed-in user, or investors only?
- Where should search live: its own page, or inside Deals?
