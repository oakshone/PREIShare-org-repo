// Types for generating property embeddings (docs/embedding-data-model.md).
//
// Types only: no API calls, no env reads, no secrets. The module that calls the
// embedding provider comes later and must run on the server only.

/**
 * Numbers per embedding. Must match `vector(1536)` in
 * supabase/migrations/20250315000000_enable_pgvector_properties.sql.
 * Never change one without the other (new migration + re-embed every row).
 */
export const EMBEDDING_DIMENSION = 1536

/** The listing text an embedding is made from: "{title}\n\n{description}". */
export type PropertyEmbeddingInput = {
  title: string
  description: string
}

export type EmbeddingSuccess = {
  ok: true
  /** Exactly EMBEDDING_DIMENSION numbers. */
  vector: number[]
  /** Which model made the vector, e.g. for logs. Every row must use the same one. */
  model?: string
}

export type EmbeddingFailure =
  | { ok: false; reason: 'empty_text' }
  | { ok: false; reason: 'wrong_dimension'; expected: number; received: number }
  | { ok: false; reason: 'missing_api_key' }
  /** `message` is for server logs only; never show raw provider errors to users. */
  | { ok: false; reason: 'provider_error'; message: string; status?: number }

export type EmbeddingResult = EmbeddingSuccess | EmbeddingFailure
