# Vector search learner notes (PREIshare)

## 1. My plain-language definition
Vector similarity ranking means: turn the buyer’s query into an embedding, compare that list of numbers to each stored property embedding, score how close the meanings are, and return the closest properties first.

## 2. How a search runs (steps I can explain)
1. Buyer types a natural-language query (from our requirements examples).
2. System creates a **query embedding** with the same embedding approach used for listings.
3. System compares the query embedding to **stored property embeddings**.
4. Each property gets a **distance or similarity score**.
5. Results are **ranked** best-first and cut to **top-K** (for example K = 5).

```text
[Buyer query text]
        |
        v
[Query embedding] ----compare----> [Property embeddings in database]
        |
        v
[Scores] -> [Sort best-first] -> [Top-K listings shown]
```

## 3. Keyword search vs vector search (same query)
**Example query:** quiet cabin near water with good rental upside

| Approach | What it looks for | Likely miss |
| --- | --- | --- |
| Keyword | Exact words like "cabin", "water", "rental" | Listing that says "lakeside cottage, peaceful, strong short-term income" |
| Vector / semantic | Nearby meaning even when words differ | Still can miss if the listing text is empty, misleading, or was never embedded |

**My takeaway:** PREIshare needs vector ranking because investors describe *intent*, and listings use many different phrasings.

## 4. Worked ranking examples (no real math required)

### Example A — clear winner
Query: "family-friendly home near good schools"

| Listing blurb (short) | Expected rank | Why |
| --- | --- | --- |
| "4BR near top-rated elementary, quiet cul-de-sac, yard for kids" | 1 (best) | Same intent: family + schools |
| "2BR downtown loft, nightlife, walk to offices" | lower | Different lifestyle |
| "Industrial warehouse, high ceilings, loading dock" | lowest | Unrelated meaning |

### Example B — different words, same intent
Query: "cabin by the lake"
Strong match listing: "rustic woodland retreat on the water with dock"
Why vector should win: shared meaning (small getaway + water) even without the word "cabin" or "lake".
Why keyword may fail: few or no shared exact tokens.

## 5. Top-K and scores (what I will check later)
- **Top-K:** only return K nearest neighbors The listings whose numbers are closest to the search. It's just another name for the top-K results.
- **Distance score:** smaller usually means closer/more similar (when using distance).
- **Similarity score:** larger usually means closer/more similar (when using similarity).
- I must know which kind of score our later SQL returns so I do not sort the wrong way.
- A score alone is not enough in the UI later—I still want property id, title/summary, and the score for debugging.

## 6. What good ranking is *not*
- Not alphabetical order of titles
- Not “newest listing first” unless we add that as a separate product rule later
- Not filtering only with SQL ILIKE/keyword match and calling it semantic
- Not comparing embeddings that were built with different models/dimensions (apples to oranges)

## 7. Assessment questions for a future match_properties-style function
I will reject agent output later unless I can answer YES to these:
1. Does the function take a **query embedding** (or clearly take query text and embed it with the same method as listings)?
2. Does it compare that vector to the **stored property embedding column**, not to raw description text alone?
3. Does it **order** results so the best semantic matches come first (correct direction for distance vs similarity)?
4. Does it support **top-K** (a limit on how many neighbors return)?
5. Does each row include enough fields to explain the hit (at least property id, a human-readable label/snippet, and the score)?
6. Does it avoid silently mixing different embedding sizes/models?
7. If sample data includes an intentional semantic match with different wording, does that row rank above an unrelated keyword-only distractor?

## 8. Link back to requirements
Relevant example queries from docs/semantic-search-requirements.md:
- “quiet cabin near water with good rental upside”
- “family-friendly home close to good schools”
- “downtown condo walkable to restaurants”

Success criteria this ranking model supports:
- A similarity search returns a ranked list (best match first) for a natural-language query
- At least one demo query returns a relevant property even when key query words are missing from the listing text
- A beginner can explain why keyword search would fail on that same query

## 9. Open questions for later steps
- Which distance metric will Supabase/pgvector use in our migration (name only for now)?
- What default K should the first API use?
- What minimum fields should the first UI show next to each ranked hit?
