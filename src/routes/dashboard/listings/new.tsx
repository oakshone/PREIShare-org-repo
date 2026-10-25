// src/routes/dashboard/listings/new.tsx
// Create page under the protected dashboard. Submits through the createListing server function
// (session check, validation, owner from the session); goes back to the list on success.
import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { ListingForm } from '../../../components/listings/ListingForm'
import type { ListingFormProps, ListingFormValues } from '../../../components/listings/ListingForm'
import { createListingSchema } from '../../../lib/listings/schema'
import { createListing } from '../../../server/listings'

export const Route = createFileRoute('/dashboard/listings/new')({
  component: NewListingPage,
})

type FieldErrors = NonNullable<ListingFormProps['fieldErrors']>

function NewListingPage() {
  const router = useRouter()
  const saveListing = useServerFn(createListing)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(values: ListingFormValues) {
    setErrorMessage(null)

    // Instant feedback with the same schema the server uses; the server checks again.
    const check = createListingSchema.safeParse(values)
    if (!check.success) {
      setFieldErrors(z.flattenError(check.error).fieldErrors as FieldErrors)
      setErrorMessage('Fix the highlighted fields.')
      return
    }
    setFieldErrors({})

    setIsSubmitting(true)
    try {
      const result = await saveListing({ data: values })
      if (!result.ok) {
        setFieldErrors((result.fieldErrors ?? {}) as FieldErrors)
        setErrorMessage(result.error)
        return
      }
      // Only navigate away after a confirmed insert; reload so the list shows it.
      await router.invalidate()
      await router.navigate({ to: '/dashboard/listings' })
    } catch {
      setErrorMessage("We couldn't reach the server. Check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="new-listing-heading" className="flex flex-col gap-4">
      <h2 id="new-listing-heading" className="display-title m-0 text-xl font-bold text-(--sea-ink)">
        Add a property listing
      </h2>
      <p className="m-0 text-sm text-(--sea-ink-soft)">
        New listings are saved as drafts for your sponsor account only.
      </p>
      <ListingForm
        onSubmit={handleSubmit}
        submitLabel="Create listing"
        errorMessage={errorMessage}
        fieldErrors={fieldErrors}
        isSubmitting={isSubmitting}
      />
    </section>
  )
}
