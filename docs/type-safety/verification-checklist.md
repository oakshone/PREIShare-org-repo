# Investor listing types - verification checklist

Use this list before review. Check each box only when you have evidence.

## A. Domain coverage

- [ ] Read `docs/domain/investor-listing-domain-brief.md` before changing listing fields or status rules.
- [ ] Every required field from the field inventory appears on `InvestorListing` or a nested type it uses.
- [ ] Listing statuses match the allowed business statuses with no free-form strings.
- [ ] Property type values match the allowed property kinds.
- [ ] Address and `FinancialSummary` nested shapes match the inventory.
- [ ] Investor contact and ownership relationship fields match the domain brief.

## B. Type safety shape

- [ ] Confirm `src/types/index.ts` only re-exports public types.
- [ ] Confirm public types are exported from `src/types/index.ts`.
- [ ] Confirm discriminated status modeling matches `docs/type-safety/expected-type-errors.md`.
- [ ] Confirm readonly intent is documented and present on agreed identity/audit fields.
- [ ] Confirm nested types remain named imports rather than inline copies.

## C. Fixtures

- [ ] Confirm `src/fixtures/sample-investor-listings.ts` imports `InvestorListing` from `../types`.
- [ ] Confirm every named sample is annotated as `InvestorListing`, without `as InvestorListing` assertions.
- [ ] Confirm the valid samples cover each allowed status.
- [ ] Confirm published, under-offer, and sold samples include a financial summary and at least one contact.
- [ ] Confirm the sold sample includes `closedAt`.
- [ ] Confirm every sample uses valid nested address, financial summary, contact, ownership, and property-type shapes.
- [ ] Confirm the combined sample array is typed as `InvestorListing[]`.

## Intentional error fixtures

- [ ] Confirm `src/fixtures/invalid-listings.errors.ts` uses `satisfies InvestorListing` or an equivalent direct type check.
- [ ] Confirm the invalid fixture is not silenced with `any` or `@ts-ignore`.
- [ ] Confirm it demonstrates an invalid status or property type.
- [ ] Confirm it demonstrates a sold listing missing `closedAt`.
- [ ] Confirm it demonstrates a published listing missing `financialSummary`.
- [ ] Confirm it demonstrates a numeric financial field supplied as a string.
- [ ] Confirm the expected failures are documented in `docs/type-safety/expected-type-errors.md`.

## D. Typecheck gate

- [ ] `src/types/package.json` defines a `typecheck` script that runs `tsc --noEmit`.
- [ ] From the repository root, run `npm --prefix src/types run typecheck`.
- [ ] Expect the scoped types check to exit with code `0` and report no diagnostics for valid sources.
- [ ] Remember that the intentional invalid fixture is outside the `src/types` package and is not part of that clean check.
- [ ] To inspect intentional failures, run the focused command documented in `src/types/README.md`.
- [ ] Expect the focused invalid-fixture check to fail and report the documented diagnostics.
- [ ] Do not treat a failing intentional-error check as a regression unless its errors or count differ from the documentation.

## E. Sign-off

- [ ] Re-run typecheck after any last fixes.
- [ ] Hand the package to a teammate with no undocumented typecheck steps.
