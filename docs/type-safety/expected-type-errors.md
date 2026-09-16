# Expected Type Errors

This note documents the intentional failures in `src/fixtures/invalid-listings.errors.ts`. The fixture file is a teaching aid: it should fail a focused TypeScript check because each sample violates one listing rule.

## `invalidStatusListing`

- **Business problem:** The listing uses `active`, but `active` is not one of the approved lifecycle statuses.
- **Rule that should catch it:** `InvestorListing.status` must use the closed `ListingStatus` union: `draft`, `published`, `under_offer`, `sold`, or `archived`.
- **Expected TypeScript error:** Wrong string literal; `"active"` is not assignable to the allowed status union.

## `soldListingWithoutClosedAt`

- **Business problem:** The listing says the transaction is sold but does not record when it closed.
- **Rule that should catch it:** The `status: 'sold'` branch is `SoldInvestorListing`, which requires `closedAt: string`.
- **Expected TypeScript error:** Missing required property; `closedAt` is required for sold listings.

## `publishedListingWithoutFinancialSummary`

- **Business problem:** The listing is publicly published without the financial summary investors need.
- **Rule that should catch it:** The `status: 'published'` branch requires `financialSummary: FinancialSummary`.
- **Expected TypeScript error:** Missing required property; `financialSummary` is required for published listings.

## `listingWithStringFinancialMetric`

- **Business problem:** The asking price is written as text instead of a numeric amount.
- **Rule that should catch it:** `FinancialSummary.askingPrice` must be a `number` so financial calculations do not receive text.
- **Expected TypeScript error:** Type mismatch; a string is not assignable to `number`.

## `invalidPropertyTypeListing`

- **Business problem:** The listing uses `commercial`, but the domain brief defines the property categories as `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, and `land`.
- **Rule that should catch it:** `InvestorListing.propertyType` must use the closed `PropertyType` union.
- **Expected TypeScript error:** Wrong string literal; `"commercial"` is not assignable to the allowed property-type union.

## Invalid values that currently still type-check

The current types catch the four examples above, but they do not yet validate every business constraint. The following values would still be accepted because the fields are currently broad `string` or `number` types:

### Financial values

- `financialSummary.currency: 'NOT-A-CURRENCY'` — accepted because currency is currently `string`; a closed currency-code type or runtime validation would be needed.
- `financialSummary.askingPrice: -500` — accepted because the field is `number`; the type does not enforce a positive amount.
- `financialSummary.projectedIrrPercent: 250` — accepted because the field is `number`; no percentage range is enforced.
- `financialSummary.capRatePercent: -4` — accepted because the field is `number`; no non-negative range is enforced.

### Ownership and contact values

- `ownership.ownershipPercent: 150` or `-10` — accepted because the field is `number`, even though the documented range is 0–100.
- `primaryContactId: 'contact-does-not-exist'` — accepted because it is a plain `string`; TypeScript does not currently prove that it matches an ID in `contacts`.
- `InvestorContact.fullName: ''` — accepted because it is a `string`; non-empty validation is not encoded.
- `InvestorContact.role: ''` — accepted because role is currently a general `string`.
- `InvestorContact.email: 'not-an-email'` — accepted because email has no format validation.
- `InvestorContact.phone: 'not-a-phone'` — accepted because phone has no format validation.

### Address and audit values

- `address.line1: ''`, `address.postalCode: 'wrong'`, or `address.country: ''` — accepted because these fields are plain strings.
- `createdAt: 'yesterday'`, `updatedAt: 'not-a-date'`, or `closedAt: 'sometime'` — accepted because timestamps are represented as strings without date-format validation.

These gaps are not errors in the five teaching fixtures. They mark the boundary between the current compile-time shape checks and future stricter types or runtime validation.

## Checking strategy

- `npm run typecheck` runs the clean root check with `tsc --noEmit`. It includes valid project sources and `src/fixtures/sample-investor-listings.ts`, but excludes `src/fixtures/invalid-listings.errors.ts`.
- The invalid fixture is checked separately with a focused TypeScript command and is expected to fail with the five documented diagnostics.
