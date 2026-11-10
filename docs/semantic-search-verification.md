# Semantic search verification report (PREIshare)

## Scope checked
- Requirements source: `docs/semantic-search-requirements.md`
- UI: `src/routes/search.tsx`
- API: `src/routes/api/properties/search.ts`
- Search helper: `src/lib/property-search.ts`
- Seed inputs: `data/sample-properties.json`, `scripts/seed-property-embeddings.ts`

Also involved: `supabase/migrations/20250315000000_enable_pgvector_properties.sql` (table),
`20250315000001_match_properties_function.sql` (search function),
`20250315000002_properties_read_policy.sql` (read policy), `src/lib/embeddings/generate.ts`.

## Environment
- Date tested: 2026-11-10
- Supabase project (name or ref only, no secrets): development project `atanpnrqajydageytkzv`
- App run method (e.g. local dev server): local dev server (`npm run dev`) for the browser checks
  (Jackson); API status codes on a local production build (`vite preview`); ranking queries by a
  read-only Node script that calls the same `generateQueryEmbedding` and `match_properties` the
  app uses (admin key, so RLS was skipped for that script only)
- Embedding model / dimension expected: OpenAI `text-embedding-3-small`, 1536

## Data checks
| Check | Result | Notes |
| --- | --- | --- |
| Sample properties present | PASS | row count: 10 (all of `data/sample-properties.json`) |
| Embeddings non-null for all samples | PASS | null count: 0; every embedding has 1536 numbers |
| Seed script re-runnable without breaking search | PASS | Re-run by Jackson, 2026-11-10: `Done: 0 inserted, 10 skipped, 0 failed.` No duplicates; still 10 rows; skipped rows make no OpenAI calls |

## Query results (semantic)
Similarity = 1 − cosine distance, from `match_properties` (higher = closer; not a percentage).

| # | Query | Top 3 results (title or id) | Sensible neighbors? | Notes |
| --- | --- | --- | --- | --- |
| 1 | quiet cabin near water with good rental upside | Lakefront cabin (0.669), Woodland retreat with dock (0.606), Downtown loft with cabin-style kitchen (0.568) | YES | Top 2 are right. #3 is a keyword distractor; the Riverside cottage (a real match) is only #5 (0.477) |
| 2 | family-friendly home close to good schools | Family home on a cul-de-sac (0.693), Suburban starter home (0.600), Downtown loft with cabin-style kitchen (0.335) | YES | Both family homes clearly on top; big drop (0.600 → 0.335) before anything unrelated |
| 3 | downtown condo walkable to restaurants | Downtown condo (0.729), Downtown loft with cabin-style kitchen (0.531), Bright urban unit (0.441) | YES | All three are city listings; the getaways are at the bottom |

Control query (brief query 4), "large farmland acreage for crops": best score only **0.317**
(Industrial warehouse), well below the 0.67–0.73 tops above. No strong match, as the brief requires.

## Keyword-trap check
- Trap query (paraphrase, not exact listing text): "sunny walkable condo near transit"
- Expected kind of property: a bright city unit near public transport, i.e. **Bright urban unit**
  ("Bright urban unit, steps from cafés and a short walk to the station"), which shares no words
  with the query
- Actual top results: 1. Sunny hilltop cabin (0.513), 2. Downtown condo (0.501), 3. Bright urban unit (0.483)
- Did semantic search beat exact-keyword matching? NO (partly)
- Evidence (one sentence): The trap listing ("**Sunny** hilltop cabin … **condo**-style finishes")
  still ranked first on its shared words, although the intended match, which keyword matching would
  have ranked last with zero shared words, came a close third (0.483 vs 0.513).

## Safety / edge cases
| Case | Expected | Actual | PASS / FAIL |
| --- | --- | --- | --- |
| Empty query | Clear error or empty list, no crash | API: no `q` → 400 "Add a search query…"; blank `q` → 400 "The search query is empty…". Page: shows "Type what you are looking for." without calling the API | PASS |
| Nonsense tokens | Low similarity or empty, no crash | "xqzv blorp fnarg 7731": all scores 0.106–0.162, the lowest of any query; no crash. Top-K still returns 5 rows (shown with their low scores) | PASS |
| Very short query | Stable response | "cabin": Sunny hilltop cabin (0.474), Lakefront cabin (0.418), Woodland retreat with dock (0.340); no crash | PASS |

Also checked (API, signed out): valid query → 401; `limit=0` / `limit=abc` / 501-character query → 400;
POST / DELETE → 405; every response JSON with `Cache-Control: no-store`. Browser, private window:
search shows "You must be signed in to search." and a Sign in link that returns to `/search`.

## Refine cycle (required)
- Failing or weak example (query + bad ranking or error): "sunny walkable condo near transit" ranks
  the trap "Sunny hilltop cabin" first (0.513) above the intended "Bright urban unit" (0.483). Same
  pattern in query 1: two keyword distractors outrank "Riverside cottage".
- Suspected layer (seed data / embedding text / SQL distance / helper / API / UI): **embedding text /
  seed data**. The embedded text starts with the title, so title words like "Sunny" and "cabin" pull
  hard; and the intended matches have short descriptions with few signals. SQL distance, helper,
  API and UI are behaving as designed (order and scores match the database exactly).
- Change made (files touched): **none, by decision (2026-11-10).** The weakness is recorded as a
  known limitation instead of tuned away, so the demo shows how the search really behaves on short,
  keyword-heavy sample text. Considered but not done: giving "Bright urban unit" and "Riverside
  cottage" fuller descriptions in `data/sample-properties.json` and re-embedding those 2 rows.
- Re-test result: not applicable (no change). Baseline kept on record: trap query → Sunny hilltop
  cabin 0.513, Downtown condo 0.501, Bright urban unit 0.483; query 1 → Riverside cottage #5 (0.477).
- Keep or revert decision: **keep** the current data, embedding text and SQL. Revisit if a
  stakeholder demo needs the trap query to pass (try the description change above first).

## Requirements traceability
| Requirement / success criterion | Met? | Evidence |
| --- | --- | --- |
| Sample properties exist with description text and stored embedding vectors | YES | Data checks: 10 rows, 0 null, all 1536 |
| A similarity search returns a ranked list (best match first) for a natural-language query | YES | Queries 1–3: scores fall down every list; page shows server order |
| At least one demo query returns a relevant property even when key query words are missing from the listing text | YES | Query 1: "Woodland retreat with dock" is #2 with none of "quiet", "cabin", "water"; trap query: "Bright urban unit" is #3 with no shared words |
| A beginner can explain why keyword search would fail on that same query | YES | `docs/vector-search-learner-notes.md` section 3; cheat sheet "Semantic search"; quiz answers |
| In-scope vs out-of-scope boundaries are respected in code and docs produced later | YES | No filters, map search, payments or hybrid ranking. Sign-in reuses the existing Sprint 4 login (no new auth work) |
| Example query 4: control query should not produce a strong match | YES | Best score 0.317 vs 0.669–0.729 for real queries |

## Remaining limitations (honest handoff)
- What this tutorial slice does **not** do yet (filters, auth, production embedding jobs, etc.):
  - No filters (price, beds, location), map search, or hybrid keyword + vector ranking.
  - Uses a separate demo table (`properties`), not sponsors' real `property_listings`.
  - No automatic re-embedding when text changes; the seed script is run by hand with the admin key.
  - No vector index (fine for 10 rows; needed at scale).
  - `/search` isn't in the dashboard nav, and isn't behind the dashboard guard (the API checks sign-in).
  - Raw scores are shown for debugging; there are no stakeholder-friendly labels yet.
- Known ranking weaknesses on the sample set:
  - **Keyword-trap check failed (accepted, 2026-11-10):** shared words still pull keyword
    distractors up. "sunny walkable condo near transit" ranks "Sunny hilltop cabin" first; query 1
    ranks two distractors above "Riverside cottage". Not a code bug: the order and scores are
    exactly what the database returns. Left as is on purpose (see Refine cycle).
  - Real matches top out around 0.6–0.73, not 1.0, so score thresholds need more test queries.
  - Top-K always returns results, even for nonsense (scores ~0.15); no cut-off yet.
- Follow-ups for the next topic:
  - If the keyword trap must pass: try fuller sample descriptions first (see Refine cycle).
  - Decide a minimum score (cut-off) and plain labels using more queries.
  - If real listings are searched: column-safe investor read path (risk R4), and a policy that
    isn't `USING (true)`.

## Sign-off
- Verified by: Jackson Nieporte (browser checks); Claude Code (query script, API status codes)
- Ready to demo to a stakeholder? **YES** (Jackson, 2026-11-10), with the keyword-trap weakness
  stated up front
- Blockers before demo: none (the keyword-trap failure is accepted and must be mentioned in the
  demo).
