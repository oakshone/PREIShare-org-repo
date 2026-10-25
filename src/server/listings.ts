// src/server/listings.ts
// Server-only list / create / update for the signed-in sponsor's property listings.
//
// Every handler runs only on the server (createServerFn); browser code calls them as RPCs and
// none of this code ships to the client. Each one:
//   1. checks the session with getSessionUser() (verified auth.getUser()); no user → error,
//   2. uses only the server Supabase client (anon key + the user's cookies), so RLS applies;
//      never the browser client or the service-role key,
//   3. validates input with the zod schemas in src/lib/listings/schema.ts (returns fieldErrors),
//   4. takes ownership from the session (owner_id = user.id), never from the request body.
// RLS (owner_id = auth.uid()) is the real lock; the .eq('owner_id', …) filters are a second check.
//
// Not wired into UI routes yet.
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getSessionUser } from '../lib/auth/session'
import { createListingSchema, updateListingSchema } from '../lib/listings/schema'
import type { UpdateListingInput } from '../lib/listings/schema'
import { getSupabaseServerClient } from '../lib/supabase/server'
import type { Database, PropertyListing } from '../lib/supabase/types'

/** One row of property_listings, as the database returns it. */
export type ListingRow = PropertyListing

export type ListingsResult =
  | { ok: true; listings: ListingRow[] }
  | { ok: false; error: string }

export type ListingMutationResult =
  | { ok: true; listing: ListingRow }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

type ListingUpdateRow = Database['public']['Tables']['property_listings']['Update']

/** zod issues → { field: [messages] } for the form. */
function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const [field, messages] of Object.entries(z.flattenError(error).fieldErrors)) {
    if (Array.isArray(messages) && messages.length > 0) fieldErrors[field] = messages
  }
  return fieldErrors
}

/** Schema field names → table columns (`state` is stored in `region`). */
function toUpdateRow(patch: Omit<UpdateListingInput, 'id'>): ListingUpdateRow {
  const { state, ...rest } = patch
  return state === undefined ? rest : { ...rest, region: state }
}

/** Loader: listings for the signed-in sponsor only (RLS + session). */
export const listMyListings = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ListingsResult> => {
    const user = await getSessionUser()
    if (!user) {
      return { ok: false, error: 'You must be signed in to view listings.' }
    }

    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('property_listings')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[server/listings] List failed:', error)
      return { ok: false, error: 'Could not load listings. Try again.' }
    }

    return { ok: true, listings: data ?? [] }
  },
)

/** Action: create a listing owned by the session user — never trust an owner id from the body. */
export const createListing = createServerFn({ method: 'POST' })
  // Typed for callers; the handler validates with safeParse, because the body is untrusted.
  .validator((input: z.input<typeof createListingSchema>) => input)
  .handler(async ({ data }): Promise<ListingMutationResult> => {
    const user = await getSessionUser()
    if (!user) {
      return { ok: false, error: 'You must be signed in to create a listing.' }
    }

    const parsed = createListingSchema.safeParse(data)
    if (!parsed.success) {
      return {
        ok: false,
        error: 'Fix the highlighted fields.',
        fieldErrors: toFieldErrors(parsed.error),
      }
    }

    const { state, ...input } = parsed.data
    const supabase = getSupabaseServerClient()

    const { data: row, error } = await supabase
      .from('property_listings')
      .insert({
        ...input,
        region: state,
        owner_id: user.id, // ownership from session only; RLS WITH CHECK double-checks it
      })
      .select('*')
      .single()

    if (error || !row) {
      console.error('[server/listings] Insert failed:', error)
      return {
        ok: false,
        error: 'Could not create listing. Check your input and try again.',
      }
    }

    return { ok: true, listing: row }
  })

/** Action: update only if the row is visible under RLS for this sponsor. */
export const updateListing = createServerFn({ method: 'POST' })
  .validator((input: z.input<typeof updateListingSchema>) => input)
  .handler(async ({ data }): Promise<ListingMutationResult> => {
    const user = await getSessionUser()
    if (!user) {
      return { ok: false, error: 'You must be signed in to update a listing.' }
    }

    const parsed = updateListingSchema.safeParse(data)
    if (!parsed.success) {
      return {
        ok: false,
        error: 'Fix the highlighted fields.',
        fieldErrors: toFieldErrors(parsed.error),
      }
    }

    const { id, ...patch } = parsed.data
    if (Object.keys(patch).length === 0) {
      return { ok: false, error: 'No fields to update.' }
    }

    const supabase = getSupabaseServerClient()
    const { data: row, error } = await supabase
      .from('property_listings')
      .update(toUpdateRow(patch))
      .eq('id', id)
      .eq('owner_id', user.id)
      .select('*')
      .single()

    // A row RLS hides (someone else's, or missing) matches 0 rows: .single() turns that into an
    // error, so a blocked update can never look like success (risk R5).
    if (error || !row) {
      console.error('[server/listings] Update failed:', error)
      return {
        ok: false,
        error: 'Could not update listing. It may not exist or you may not own it.',
      }
    }

    return { ok: true, listing: row }
  })
