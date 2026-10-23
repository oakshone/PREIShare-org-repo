// src/routes/dashboard/properties.new.tsx
// /dashboard/properties/new: form for a sponsor to create a property listing.
// The parent layout (src/routes/dashboard.tsx) already redirects signed-out visitors to /auth/login.

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '../../lib/supabase/server'

/** Turns a database error code into a message a sponsor can act on. */
function describeInsertError(code: string | undefined): string {
  switch (code) {
    case '42501': // RLS: WITH CHECK (owner_id = auth.uid()) refused the row
      return "You don't have permission to create this listing. Try signing out and back in."
    case '23514': // a CHECK rule, e.g. price >= 0
      return 'One of the values isn’t allowed (for example, a negative price). Check the form and try again.'
    case '23502': // a required column was empty
      return 'A required field is missing. Check the form and try again.'
    case '22003': // number too large for numeric(12,2)
      return 'The price is too large.'
    default:
      return 'Could not save the property. Try again.'
  }
}

// Server mutation: insert runs with the caller's session.
// RLS WITH CHECK enforces ownership (listings_insert_own: owner_id = auth.uid()).
// Do NOT trust a client-supplied owner/sponsor id.
export const createProperty = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { title: string; address: string; city: string; price: string; description?: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { ok: false as const, error: 'You must be signed in to add a property.' }
    }

    const { data: row, error } = await supabase
      .from('property_listings')
      .insert({
        title: data.title.trim(),
        address_line1: data.address.trim(),
        city: data.city.trim(),
        price: Number(data.price),
        description: data.description?.trim() || null,
        // Ownership from the session — matches RLS WITH CHECK (auth.uid()).
        owner_id: user.id,
      })
      .select('id')
      .single()

    if (error) {
      // Surface the real failure — never pretend success when RLS or constraints reject.
      // The raw database text stays in the server log; the user gets a plain message
      // (security checklist 4.3: no raw DB internals in the UI).
      console.error('[properties/new] Insert failed:', error)
      return { ok: false as const, error: describeInsertError(error.code) }
    }

    return { ok: true as const, id: row.id as string }
  })

export const Route = createFileRoute('/dashboard/properties/new')({
  component: NewPropertyPage,
})

function NewPropertyPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const result = await createProperty({
      data: { title, address, city, price, description },
    })

    setPending(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    // Only navigate away after a confirmed insert.
    navigate({ to: '/dashboard/properties' })
  }

  const labelClass = 'flex flex-col gap-1 text-sm font-semibold text-(--sea-ink)'
  const inputClass =
    'w-full rounded-xl border border-(--line) bg-(--surface-strong) px-3 py-2.5 text-sm font-normal text-(--sea-ink)'

  return (
    <section aria-labelledby="new-property-heading" className="flex flex-col gap-4">
      <h2
        id="new-property-heading"
        className="display-title m-0 text-xl font-bold text-(--sea-ink)"
      >
        Add property
      </h2>
      <p className="m-0 text-sm text-(--sea-ink-soft)">
        New listings are saved for your sponsor account only (enforced by RLS).
      </p>

      <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-4">
        <label className={labelClass}>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={pending}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Address
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            disabled={pending}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          City
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            disabled={pending}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Price (USD)
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            disabled={pending}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={pending}
            className={inputClass}
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="m-0 rounded-xl border border-(--danger) px-4 py-3 text-sm font-semibold text-(--danger)"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-xl bg-(--sea-ink) px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Create property'}
        </button>
      </form>
    </section>
  )
}
