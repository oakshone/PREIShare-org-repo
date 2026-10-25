// src/components/listings/ListingForm.tsx
// Labeled fields aligned with src/lib/listings/schema.ts. Presentational: no Supabase, no env.
// No status field: new listings save as 'draft' (schema default).
import type { CreateListingInput } from '../../lib/listings/schema'

type RequiredField = Exclude<keyof CreateListingInput, 'status' | 'description'>

/** Raw text from the form. Keys come from the schema, so a renamed field fails the type check. */
export type ListingFormValues = Record<RequiredField, string> & { description?: string }

export type ListingFormProps = {
  onSubmit: (values: ListingFormValues) => void | Promise<void>
  submitLabel?: string
  errorMessage?: string | null
  /** Per-field messages from createListingSchema (browser check or server). */
  fieldErrors?: Partial<Record<keyof ListingFormValues, string[]>>
  isSubmitting?: boolean
}

const inputClass =
  'w-full rounded-xl border border-(--line) bg-(--surface-strong) px-3 py-2.5 text-sm text-(--sea-ink) aria-[invalid=true]:border-(--danger)'

export function ListingForm({
  onSubmit,
  submitLabel = 'Save listing',
  errorMessage = null,
  fieldErrors = {},
  isSubmitting = false,
}: ListingFormProps) {
  function field(
    name: keyof ListingFormValues,
    label: string,
    options: { required?: boolean; inputMode?: 'decimal'; maxLength?: number; multiline?: boolean } = {},
  ) {
    const id = `listing-${name}`
    const errors = fieldErrors[name]
    const errorId = `${id}-error`
    const shared = {
      id,
      name,
      required: options.required,
      disabled: isSubmitting,
      'aria-invalid': errors ? true : undefined,
      'aria-describedby': errors ? errorId : undefined,
      className: inputClass,
    }
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-sm font-semibold text-(--sea-ink)">
          {label}
          {options.required ? null : (
            <span className="font-normal text-(--sea-ink-soft)"> (optional)</span>
          )}
        </label>
        {options.multiline ? (
          <textarea {...shared} rows={4} />
        ) : (
          <input {...shared} type="text" inputMode={options.inputMode} maxLength={options.maxLength} />
        )}
        {errors ? (
          <p id={errorId} className="m-0 text-sm text-(--danger)">
            {errors[0]}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <form
      className="flex max-w-xl flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const text = (key: string) => String(data.get(key) ?? '')
        void onSubmit({
          title: text('title'),
          address_line1: text('address_line1'),
          city: text('city'),
          state: text('state'),
          postal_code: text('postal_code'),
          price: text('price'),
          description: text('description') || undefined,
        })
      }}
    >
      {errorMessage ? (
        <p
          role="alert"
          className="m-0 rounded-xl border border-(--danger) px-4 py-3 text-sm font-semibold text-(--danger)"
        >
          {errorMessage}
        </p>
      ) : null}

      {field('title', 'Title', { required: true })}
      {field('address_line1', 'Address', { required: true })}
      <div className="grid gap-4 sm:grid-cols-3">
        {field('city', 'City', { required: true })}
        {field('state', 'State', { required: true, maxLength: 2 })}
        {field('postal_code', 'Postal code', { required: true })}
      </div>
      {field('price', 'Price (USD)', { required: true, inputMode: 'decimal' })}
      {field('description', 'Description', { multiline: true })}

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start rounded-xl bg-(--sea-ink) px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSubmitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
