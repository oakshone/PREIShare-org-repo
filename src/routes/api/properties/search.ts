// src/routes/api/properties/search.ts
// GET /api/properties/search?q=<buyer's words>&limit=<1-50, optional>
//
// Semantic property search over HTTP. Thin wrapper: checks the request, then calls
// searchProperties (src/lib/property-search.ts), which embeds the query and runs
// public.match_properties as the signed-in user (RLS applies).
//
// NOT covered by the /dashboard guard: /api routes need their own sign-in check (below).
//
// Responses (always JSON, never cached):
//   200 { query, limit, results: [{ id, title, description, city, price, similarity }] }
//       results are best match first; similarity is 1 - cosine distance (higher = closer),
//       for debugging, not a percentage to show users.
//   400 { error } missing/empty/too-long query, or a bad limit
//   401 { error } not signed in
//   405 { error } any method other than GET
//   500 { error } embedding or database failure (details in the server log only)
import { createFileRoute } from '@tanstack/react-router'
import { getSessionUser } from '../../../lib/auth/session'
import { DEFAULT_SEARCH_LIMIT, searchProperties } from '../../../lib/property-search'

/** Longer queries are rejected so one request can't send a huge text to OpenAI. */
const MAX_QUERY_LENGTH = 500
const MAX_LIMIT = 50

function json(body: unknown, status: number): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

/** Without these, other methods fall through to the HTML app and return a page with 200. */
function methodNotAllowed(): Response {
  return Response.json(
    { error: 'Use GET, for example /api/properties/search?q=quiet cabin near water.' },
    { status: 405, headers: { Allow: 'GET', 'Cache-Control': 'no-store' } },
  )
}

export const Route = createFileRoute('/api/properties/search')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams

        // 1. Check the input before spending anything.
        const rawQuery = params.get('q')
        if (rawQuery === null) {
          return json({ error: 'Add a search query, for example ?q=quiet cabin near water.' }, 400)
        }
        const query = rawQuery.trim()
        if (!query) {
          return json({ error: 'The search query is empty. Type what you are looking for.' }, 400)
        }
        if (query.length > MAX_QUERY_LENGTH) {
          return json({ error: `Keep the search under ${MAX_QUERY_LENGTH} characters.` }, 400)
        }

        const rawLimit = params.get('limit')
        const limit = rawLimit === null ? DEFAULT_SEARCH_LIMIT : Number(rawLimit)
        if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
          return json({ error: `limit must be a whole number from 1 to ${MAX_LIMIT}.` }, 400)
        }

        // 2. Signed-in users only (also stops strangers spending OpenAI credit).
        const user = await getSessionUser()
        if (!user) {
          return json({ error: 'You must be signed in to search.' }, 401)
        }

        // 3. Search. Input and sign-in are already checked, so any failure here is on the server.
        try {
          const result = await searchProperties(query, limit)
          if (!result.ok) {
            return json({ error: result.error }, 500)
          }
          return json({ query, limit, results: result.matches }, 200)
        } catch (error) {
          console.error('[api/properties/search] Unexpected failure:', error)
          return json({ error: 'Search failed. Try again.' }, 500)
        }
      },
      POST: methodNotAllowed,
      PUT: methodNotAllowed,
      PATCH: methodNotAllowed,
      DELETE: methodNotAllowed,
    },
  },
})
