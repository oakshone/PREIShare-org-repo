# Embeddings learner notes (PREIshare)

## Plain-language definition
An embedding is a list of numbers that captures what a piece of text means. Both the listings and the buyer's search get one, and listings come up in the search when their numbers are close to the search's numbers.

## Tiny intuition (not real model output)
Imagine a toy 3-number embedding just to picture “near” vs “far”:

- Cabin ("lakefront cabin, quiet, strong Airbnb history") → [0.9, 0.8, 0.1]
- Cottage ("waterfront cottage, peaceful, good short-term rental") → [0.88, 0.82, 0.12]: close to the cabin, because of similarities in meaning: both are quiet places by the water that make good rentals.
- Loft ("downtown loft near nightlife and offices") → [0.1, 0.2, 0.95]: far from the cabin, because there is not a similarity in meaning: it's a busy city place, not a quiet spot by the water.

Real embeddings are much longer lists (often hundreds or thousands of numbers).
The idea is the same: similar meaning → similar number patterns.

## PREIshare examples from our requirements
- Buyer query I care about: “quiet cabin near water with good rental upside”
- Cabin (should feel close to the query): very outdoorsy
- Loft (should feel far): very city, busy, not by the water
- Why Cabin is closer in meaning than Loft (in my words): It's score card reads roughly very outdoorsy not city.

## Generation vs storage (do not mix these up)
| Stage | What happens | Where |
| --- | --- | --- |
| Generation | Text goes into an embedding model/API; a number-list comes back | App/code side (later: TypeScript module), **server only**: the embedding API key is a secret, never `VITE_` |
| Storage | That number-list is saved with the property row | Database (later: Supabase PostgreSQL + pgvector) |

Search will later: embed the buyer’s query (generation) → compare to stored
property embeddings (storage + comparison). Ranking details are Step 3.

## Misconceptions to watch for when reviewing agent code later
- Thinking embeddings store the original sentence as text inside the vector
- Assuming two listings must share the same words to be “close”
- Forgetting every embedding from the same model must use the same list length (dimensions)
- Mixing up “create embedding” with “INSERT into database”
- Believing a higher or lower single number in the list is a human-readable score by itself

## What I can explain to a teammate in 60 seconds
- The database saving the numbers is the storage. The model turning text into numbers is the generation.
- Embedding is the vibe score card its not about the users its about the piece of text.
- The embedding is the list of numbers that captures what that text means.
- Generation is the model turning the text into a number list.
- Storage is the database saving the number list.
- It finds listings that mean the same thing as the buyer's search, even if they use different words, like 'quiet' and 'peaceful'.

## Open questions before similarity ranking (Step 3)
- How do we turn “closeness” into an ordered list of properties?
- What happens if two different embedding models are mixed in one table?
