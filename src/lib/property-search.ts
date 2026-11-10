// Semantic property search (SERVER-ONLY): buyer's words in, closest properties out.
//
// 1. Check someone is signed in (search lives under /dashboard; this also stops anonymous
//    callers from spending OpenAI credit).
// 2. Embed the query with generateQueryEmbedding (same model as the stored listings).
// 3. Call public.match_properties (supabase/migrations/20250315000001_match_properties_function.sql)
//    through the server client, AS THE SIGNED-IN USER, so Row Level Security applies.
// 4. Return the matches, best first, each with its similarity score.
//
// Server-only because of createServerOnlyFn: it needs the OpenAI key and the user's cookies.
// It's a plain helper, not a server function; pages reach it through a server function.
// Needs a read policy on properties for signed-in users; without one, RLS returns 0 rows.
import { createServerOnlyFn } from '@tanstack/react-start'
import { getSessionUser } from './auth/session'
import { generateQueryEmbedding } from './embeddings/generate'
import { getSupabaseServerClient } from './supabase/server'
import type { PropertyMatch } from './supabase/types'

export type { PropertyMatch }

export type PropertySearchResult =
  | { ok: true; matches: PropertyMatch[] }
  | { ok: false; error: string }

/** Top-K when the caller doesn't say. The database function also keeps it between 1 and 50. */
export const DEFAULT_SEARCH_LIMIT = 5

/**
 * Finds the properties closest in meaning to `query`, best first.
 * Never throws for expected problems: check `result.ok`. Errors are safe to show users;
 * details go to the server log only.
 */
export const searchProperties = createServerOnlyFn(
  async (query: string, limit: number = DEFAULT_SEARCH_LIMIT): Promise<PropertySearchResult> => {
    if (!query.trim()) {
      return { ok: false, error: 'Type what you are looking for to search.' }
    }

    const user = await getSessionUser()
    if (!user) {
      return { ok: false, error: 'You must be signed in to search.' }
    }

    const embedding = await generateQueryEmbedding(query)
    if (!embedding.ok) {
      console.error('[property-search] Query embedding failed:', embedding)
      return { ok: false, error: 'Search is unavailable right now. Try again.' }
    }

    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase.rpc('match_properties', {
      // pgvector accepts the vector as text: "[0.01,-0.02,...]".
      query_embedding: JSON.stringify(embedding.vector),
      match_count: limit,
    })

    if (error) {
      console.error('[property-search] match_properties failed:', error)
      return { ok: false, error: 'Could not search properties. Try again.' }
    }

    return { ok: true, matches: data ?? [] }
  },
)
