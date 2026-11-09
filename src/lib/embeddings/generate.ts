// Generates property embeddings with the embedding provider (SERVER-ONLY).
//
// Server-only because of createServerOnlyFn below: the build replaces its body with a function
// that throws in the browser, so the provider call and the API key never ship to the client.
//
// Provider: OpenAI `text-embedding-3-small`, which returns EMBEDDING_DIMENSION (1536) numbers,
// matching `vector(1536)` in supabase/migrations/20250315000000_enable_pgvector_properties.sql.
// Called with `fetch` (no SDK package). Every listing and every search query must use this
// same model, or the vectors can't be compared.
//
// Reads OPENAI_API_KEY (server-only secret, see .env.example and docs/env-var-checklist.md)
// with `process.env` inside the function, per call, never at module scope.
import { createServerOnlyFn } from '@tanstack/react-start'
import { EMBEDDING_DIMENSION } from './types.ts'
import type { EmbeddingResult, PropertyEmbeddingInput } from './types.ts'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings'
const REQUEST_TIMEOUT_MS = 15_000

/** Reads a server-only variable. Typed by `ServerEnv` in src/env.d.ts, so a misspelled name fails the type-check. */
function readServerEnv(name: keyof ServerEnv): string | undefined {
  return process.env[name]
}

/**
 * Builds the text that gets embedded, using the recipe in docs/embedding-data-model.md:
 * "{title}\n\n{description}". Use this everywhere (seed, backfill, edits) so re-embeds match.
 * Price, ids and other fields are never included.
 */
export function buildPropertyEmbeddingText(input: PropertyEmbeddingInput): string {
  return `${input.title.trim()}\n\n${input.description.trim()}`.trim()
}

/**
 * Turns a property's title + description into an embedding. Never throws for expected
 * problems: check `result.ok`, then `result.reason` on failure. Throws if called in the browser.
 */
export const generatePropertyEmbedding = createServerOnlyFn(
  async (input: PropertyEmbeddingInput): Promise<EmbeddingResult> => {
    const text = buildPropertyEmbeddingText(input)
    if (!text) {
      return { ok: false, reason: 'empty_text' }
    }

    const apiKey = readServerEnv('OPENAI_API_KEY')
    if (!apiKey) {
      return { ok: false, reason: 'missing_api_key' }
    }

    let response: Response
    try {
      response = await fetch(EMBEDDINGS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: text,
          dimensions: EMBEDDING_DIMENSION,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
    } catch (error) {
      // Network failure or timeout. The message never contains the key.
      return {
        ok: false,
        reason: 'provider_error',
        message: error instanceof Error ? error.message : 'Request to embedding provider failed',
      }
    }

    const body: unknown = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        ok: false,
        reason: 'provider_error',
        status: response.status,
        message: readProviderErrorMessage(body) ?? `Embedding provider returned ${response.status}`,
      }
    }

    const vector = readEmbedding(body)
    if (!vector) {
      return {
        ok: false,
        reason: 'provider_error',
        status: response.status,
        message: 'Embedding provider response had no usable embedding',
      }
    }

    if (vector.length !== EMBEDDING_DIMENSION) {
      return {
        ok: false,
        reason: 'wrong_dimension',
        expected: EMBEDDING_DIMENSION,
        received: vector.length,
      }
    }

    return { ok: true, vector, model: readModel(body) ?? EMBEDDING_MODEL }
  },
)

// The provider's JSON is untyped, so these read it defensively instead of trusting its shape.
// Expected success shape: { data: [{ embedding: number[] }], model: string }

function readEmbedding(body: unknown): number[] | null {
  if (!isRecord(body) || !Array.isArray(body.data)) return null
  const first: unknown = body.data[0]
  if (!isRecord(first) || !Array.isArray(first.embedding)) return null
  const values: unknown[] = first.embedding
  return values.every((n) => typeof n === 'number' && Number.isFinite(n))
    ? (values as number[])
    : null
}

function readModel(body: unknown): string | null {
  return isRecord(body) && typeof body.model === 'string' ? body.model : null
}

function readProviderErrorMessage(body: unknown): string | null {
  if (!isRecord(body) || !isRecord(body.error)) return null
  return typeof body.error.message === 'string' ? body.error.message : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
