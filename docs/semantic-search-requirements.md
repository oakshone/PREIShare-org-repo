# PREIshare semantic search — requirements brief

## Problem (one paragraph)
PREIshare buyers discover investment properties by describing lifestyle and investment intent in everyday language. Keyword search only matches exact words in listing text, so queries like “quiet cabin near water with good rental upside” miss strong matches when those words never appear together. This tutorial will add a small semantic search slice: turn property descriptions into meaning-aware vectors, store them in Supabase PostgreSQL with pgvector, and rank sample listings by similarity.

## Actors
| Actor | Goal |
| --- | --- |
| Property buyer / investor | Find listings that match intent, not only exact phrases |
| PREIshare operator (us) | Demo trustworthy semantic matches on sample data and hand off cleanly |
| Coding agent (assistant) | Produce migrations, embedding helpers, and UI only inside the stated scope |

## Example queries (must drive later tests)
1. “quiet cabin near water with good rental upside”
   **Good top result:** a secluded cabin by a lake or river whose description talks about strong short-term rental demand, even if it says “lakefront retreat” and “steady bookings” instead of “quiet”, “water” or “upside”.
2. “family-friendly home close to good schools”
   **Good top result:** a house with several bedrooms and a yard in a residential neighbourhood, described as near a well-rated elementary school or school district.
3. “downtown condo walkable to restaurants”
   **Good top result:** a city-centre apartment or condo described as steps from cafés, bars and dining, even if it says “urban loft” instead of “downtown condo”.
4. Near-miss control: “large farmland acreage for crops”
   **Good behaviour:** with cabins, family homes and condos as samples, no listing should be a strong match. The farmland query must *not* push any cabin or condo to the top with a high similarity score, and it must not dominate the results of queries 1–3.

## Success criteria (observable)
- [ ] Sample properties exist with description text and stored embedding vectors
- [ ] A similarity search returns a ranked list (best match first) for a natural-language query
- [ ] At least one demo query returns a relevant property even when key query words are missing from the listing text
- [ ] A beginner can explain why keyword search would fail on that same query
- [ ] In-scope vs out-of-scope boundaries are respected in code and docs produced later

## In scope for this tutorial
- Plain-language understanding of embeddings and vector similarity (later steps)
- Data model for properties + embedding vectors suitable for Supabase + pgvector
- Migration to enable pgvector and store vectors
- TypeScript helper to generate embeddings for property text
- Seed/backfill path for a small sample set
- Similarity search SQL + TypeScript helper
- Minimal API route and simple React search page in TanStack Start
- End-to-end verification notes and handoff doc

## Out of scope (explicit non-goals)
- Production embedding provider billing, rate-limit ops, or batch jobs at scale
- Map search, filters (price, beds), auth, payments, or messaging
- Advanced ranking (personalization, business rules, hybrid keyword+vector tuning beyond a basic demo)
- Perfect design polish or mobile app work

## Assumptions and open questions
- Free-tier Supabase is enough for sample data
- Embedding model/dimension choice will be decided in the data-model step and must stay consistent end-to-end
- Open questions to resolve later: exact embedding provider, vector dimension, distance metric (e.g. cosine), how many sample listings

**Project rules that still apply (from `AGENTS.md` and Sprint 4):**
- The embedding provider's API key is a **server-only secret**: no `VITE_` prefix, read only on the server, added to `.env.example` (empty), `docs/env-var-checklist.md` and `src/env.d.ts`, and never pasted into docs, git or chat. Embeddings are generated on the server, never in the browser.
- Schema changes go in a **new** migration in `supabase/migrations/`, and any new table has Row Level Security enabled.
- "Auth" being out of scope means **no new sign-in work**. If the search page lives under `/dashboard`, the existing guard in `src/routes/dashboard/route.tsx` still protects it.

**Extra open questions for this project:**
- Where does the search page live: a new page, or a search box on the existing Deals page (`docs/architecture-decisions.md`, foundation C)? A new page needs approval first (`docs/dashboard-ia.md`).
- Are the sample properties a separate demo table, or rows in `property_listings`? Using `property_listings` would mean only each listing's owner can see it (risk R4 in `docs/data-model/rls-policy-review.md`).

## Handoff note for later steps
Every implementation step should be checkable against the example queries and success criteria above. If a prompt would add out-of-scope work, cut it.
