# PREIshare embedding data model

## Purpose
Software-ready design for property listings and their embedding vectors.
This doc is the contract for pgvector migrations, TypeScript types, seed/backfill, and similarity search.
It is not SQL and not application code yet.

## Sources
- docs/semantic-search-requirements.md
- docs/embeddings-learner-notes.md
- docs/vector-search-learner-notes.md

## Overview
Each **property** is one investment listing PREIshare can show in search.
Each property has normal text/number fields humans read, plus one **embedding** column:
a fixed-length list of numbers that captures the meaning of selected listing text.
Search will compare a query embedding to these stored vectors (similarity ranking)—not only exact keyword matches.

## Identifiers
| Field | Type (logical) | Required | Notes |
|-------|----------------|----------|-------|
| id | UUID (or stable text id) | yes | Primary key; unique per listing |

## Core listing fields (this tutorial slice)
| Field | Type (logical) | Required | Notes |
|-------|----------------|----------|-------|
| title | text | yes | Short headline for the listing |
| description | text | yes | Longer property write-up; main meaning source |
| city | text | no | Optional filter/display; include only if in requirements |
| price | number | no | Optional display; not used as the embedding itself |
| created_at | timestamp | yes | When the row was inserted |

Add other simple fields only if docs/semantic-search-requirements.md lists them as in-scope.
Do **not** expand into photos, full auth, or payments in this model.

## What text is embedded
**Embedding input (canonical string):** concatenate `title` and `description` with a clear separator, for example:

```
{title}\n\n{description}
```

Rules:
- Always build the embedding from this same recipe so re-embeds stay consistent.
- Do not embed price or ids as if they were narrative meaning (unless requirements explicitly say otherwise).
- Store the **raw** title and description unchanged; the vector is a separate column derived from them.

## Embedding column
| Field | Type (logical) | Required | Notes |
|-------|----------------|----------|-------|
| embedding | vector(1536) | yes after backfill | Fixed dimension; same size for every row and every query |

### Dimension placeholder
- **Chosen: 1536** (2026-11-07, from the course migration template). The embedding model picked later must output 1536 numbers (for example OpenAI `text-embedding-3-small`).
- **Critical:** query vectors and stored vectors must use the **same model and same dimension**. Mismatched sizes break insert or search.
- Replaced everywhere in one pass: this doc, `docs/pgvector-setup-plan.md`, `supabase/migrations/20261107000000_properties_pgvector.sql`, `src/lib/supabase/types.ts`. Any future change must do the same.

### Nullability and backfill
- New rows may allow `embedding` null only as a temporary state during insert-then-embed.
- After seed/backfill, every searchable property should have a non-null embedding.
- Document the intended lifecycle: create listing text → generate embedding → store vector → eligible for semantic search.

## Separation of concerns
| Concern | Where it lives |
|---------|----------------|
| Human-readable listing | title, description, and other scalar columns |
| Meaning for search | embedding vector column only |
| Similarity metric | Decided at query time (from vector-search notes); note the planned distance/similarity style here as a reminder, e.g. cosine similarity |

Do not replace description with the vector. You need both: text for the UI, vector for ranking.

## In scope vs out of scope (data model)
**In scope**
- One properties table (or equivalent) with id, listing fields, embedding
- One embedding per property for this tutorial
- Clear embedding input recipe and dimension placeholder

**Out of scope (do not model yet)**
- Multiple embedding versions per property
- User accounts, saved searches, permissions
- Full-text keyword indexes as a replacement for vectors (optional later)
- Production model keys, rate limits, or batch job infrastructure details

**Project rules that still apply (from `AGENTS.md`):**
- The table is created by a **new** migration in `supabase/migrations/` and has Row Level Security enabled.
- Embeddings are **generated on the server only**. The embedding API key is a server-only secret: never `VITE_`, never in docs, git or chat.

## Consistency checklist (must pass before migration)
- [ ] Every field has a clear purpose tied to requirements
- [ ] Primary key defined
- [ ] Embedding input text recipe is explicit
- [ ] Single dimension placeholder used consistently
- [ ] Raw text and vector are separate
- [ ] Null rules for embedding are stated
- [ ] Out-of-scope items are listed so the agent does not invent them later

## Open questions
- Exact embedding model name and final dimension (fill in a later step)
- Final similarity operator / distance metric in SQL (align with docs/vector-search-learner-notes.md)
- Whether city/price are required for the demo seed set
- A separate demo table, or `property_listings`? `property_listings` rows are owner-only under RLS (risk R4 in `docs/data-model/rls-policy-review.md`), so a buyer's search couldn't see other sponsors' rows. Also open in `docs/semantic-search-requirements.md`.

## Handoff
Next: plan Supabase pgvector enablement and migration order using this doc as the schema contract (docs/pgvector-setup-plan.md).
