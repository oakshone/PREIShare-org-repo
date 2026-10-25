// src/lib/listings/schema.ts
// Validation + types the server functions (src/server/listings.ts) share with later UI forms.
// Plain zod schemas: no Supabase, no env, safe in the browser and on the server.
//
// Matches property_listings (supabase/migrations/20250321000000_property_listings.sql).
// No owner field: ownership always comes from the verified session on the server.
import { z } from 'zod'

/** Allowed listing status values — keep in sync with the Postgres check constraint. */
export const listingStatusSchema = z.enum(['draft', 'published', 'archived'])

// Blank text box → undefined, so `coerce` can't turn "" into 0.
const blankToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

// numeric(12,2): never negative, at most 2 decimals, below 10,000,000,000.
const priceSchema = z.preprocess(
  blankToUndefined,
  z.coerce
    .number({ error: 'Enter an asking price.' })
    .nonnegative('Price must be zero or greater')
    .max(9_999_999_999.99, 'Price is too large')
    .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, 'Use at most 2 decimals'),
)

// The fields, with no defaults. Create adds defaults; update makes them all optional.
// (Building update from a schema WITH defaults would refill them on every update, e.g.
// resetting status to 'draft' when only the title changed.)
const listingFields = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(5000),
  address_line1: z.string().trim().min(1, 'Address is required').max(300),
  city: z.string().trim().min(1, 'City is required').max(120),
  // Saved in the table's `region` column.
  state: z.string().trim().min(2, 'State is required').max(2),
  postal_code: z.string().trim().min(3, 'Postal code is required').max(20),
  price: priceSchema,
  // Sponsors can set any allowed status, including 'published' (risk R1, open by decision).
  status: listingStatusSchema,
})

export const createListingSchema = listingFields.extend({
  description: listingFields.shape.description.optional().default(''),
  status: listingStatusSchema.default('draft'),
})

export const updateListingSchema = listingFields.partial().extend({
  id: z.uuid('Listing id must be a valid UUID'),
})

export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
