# ADR-001: Investor listing TypeScript types (PREIshare)

- **Status:** Accepted (Sprint 2, Topic 1)
- **Date:** 2026-09-17
- **Owners:** PREIshare types working group (learner + coach)
- **Related code:** `src/types/index.ts` (barrel export for the types package)

## Context

PREIshare investor listings need one shared definition so the future UI, routes, APIs, and data layer do not each invent a different shape. Previously, loose objects could allow missing prices, inconsistent status spellings, or address data that disappeared between screens.

Sprint 2 Topic 1 models the listing domain with strict TypeScript types so invalid shapes fail at compile time before users see them. The business inputs are:

- Domain brief: `docs/domain/investor-listing-domain-brief.md`
- Field inventory: `docs/domain/listing-field-inventory.md`
- Safety evidence: `docs/type-safety/expected-type-errors.md` and `docs/type-safety/verification-checklist.md`

The agreed status vocabulary is `draft`, `published`, `under_offer`, `sold`, and `archived`. The current model uses `financialSummary` as the field name, even though parts of the inventory use `financials`; this naming decision must be confirmed before API or persistence work.

## Decision

We use a small set of shared TypeScript types centered on `InvestorListing`. Other parts of the app should import them from `src/types/index.ts` instead of copying the definitions.

`InvestorListing` uses a shared `InvestorListingBase` plus status-specific branches. The status tells us which information is required. The intentional invalid fixture is excluded from the clean root check and checked separately to prove that bad listings are rejected.

### Three decisions to remember

1. **A listing has one shared shape.** `InvestorListing` keeps the important parts together: `Address`, `FinancialSummary`, `InvestorContact[]`, `Ownership`, and `PropertyType`.
2. **Status changes what is required.** `ListingStatus` only allows `draft`, `published`, `under_offer`, `sold`, or `archived`. A `sold` listing uses `SoldInvestorListing` and must include `closedAt`; published and under-offer listings must include their financial summary and at least one contact.
3. **The compiler checks examples before they become app data.** `src/fixtures/sample-investor-listings.ts` contains accepted examples. `src/fixtures/invalid-listings.errors.ts` contains rejected examples and is expected to fail its separate check. `src/types/index.ts` is the shared import point.

## Type choices mapped to business rules

| Business rule (plain language) | Type choice | Why this shape |
| --- | --- | --- |
| A listing needs core identity fields | Required properties on `InvestorListingBase` | Important listing information cannot be silently missing. |
| Status must use an approved business value | `ListingStatus` string union | Typos and invented workflow states are rejected. |
| Property category must use an approved value | `PropertyType` string union | Categories stay consistent everywhere. |
| Street/city/region/postal data travels together | Nested `Address` object type | Location remains one consistent shape instead of scattered fields. |
| Money details are a structured summary | Nested `FinancialSummary` object type | Asking price, currency, and optional return metrics stay grouped. |
| A listing can have several contacts | `contacts: InvestorContact[]` | Contact records are structured objects rather than loose text. |
| Ownership is part of the listing | `Ownership` type | The current shape keeps owner name, notes, and optional percentage together. |
| Different statuses need different details | `InvestorListing` status branches | The status tells the app what information to expect. |
| A sold listing needs a close date | `SoldInvestorListing` requires `closedAt: string` | A completed transaction must record when it closed. |
| Shared identity and audit values should not be reassigned casually | `readonly id`, `readonly createdAt`, `readonly updatedAt` | These values describe identity and recorded history. |
| Everyone should use the same definitions | Re-exports in `src/types/index.ts` | The app gets one shared set of names instead of duplicates. |

## Alternatives considered

1. **Keep listings as `string` / `any` / untyped JSON**  
	Rejected: this pushes missing fields and spelling mistakes to runtime.
2. **One giant flat interface with optional fields**  
	Rejected: optional everything hides required data and flattens business concepts.
3. **Enums for every closed vocabulary**  
	Deferred/avoided for this beginner package in favor of readable string unions.
4. **Runtime schema library as the source of truth in this topic**  
	Out of scope for Sprint 2 Topic 1; runtime validators can mirror these decisions later.
5. **A primary flag on every contact**  
	Rejected: the listing chooses its main contact, so the reference belongs on the listing.
6. **Make intentional invalid fixtures part of the clean gate**  
	Rejected: they are teaching evidence and must fail separately without being silenced.

## Consequences

**Positive**

- Product and engineering have one vocabulary for listing statuses and property types.
- Status-specific completeness rules are visible in the type model.
- Nested business concepts are reusable and harder to accidentally flatten.
- Valid fixtures demonstrate realistic accepted data.
- Invalid fixtures demonstrate that important mistakes are rejected.
- The normal root typecheck can pass without suppressing intentional teaching errors.
- The public type barrel gives future route and UI code a stable import location.

**Tradeoffs**

- The status union is more detailed than one broad listing interface.
- TypeScript checks shape and allowed literals, but not every business value. Empty strings, date formats, currency validity, numeric ranges, and email formats still need runtime validation or stricter types.
- `primaryContactId` is a string, so TypeScript cannot prove that it matches an item in `contacts`.
- The current `InvestorContact` requires email even though the inventory describes an email-or-phone rule.
- The current `Ownership` type is a single object with `ownerName`, notes, and percentage; the inventory describes ownership relationships tied to contacts and may require a list. This needs product and modeling review.
- The current `address` field is required on the shared base, while the inventory allows a draft to be incomplete. The draft workflow should be refined before relying on draft objects as partial records.
- The field is named `financialSummary` in the current types, while some inventory tables use `financials`. The existing TypeScript name is retained for consistency with the current model, but the vocabulary should be confirmed before API or persistence work.

## Out of scope for Sprint 2 Topic 1

- Building listing screens, forms, or route loaders
- Adding API routes, database tables, migrations, or persistence
- Runtime schema validation for external input
- Authentication, authorization, payments, or private-contact access policy
- Enforcing cross-field rules such as `primaryContactId` existing in `contacts`
- Choosing a final currency-code set
- Adding financial metrics not listed in the current inventory, such as NOI or occupancy
- Defining lifecycle transition permissions or audit history storage
- Changing the generated route tree or introducing a new dependency solely for validation

## Follow-ups (for the next topic / implementers)

1. Import domain types from `src/types/index.ts` in future UI or API layers.
2. Keep valid fixtures green under the typecheck scripts before expanding the model.
3. If product adds a status or property type, extend the union and update fixtures plus this ADR; do not widen the field to free `string`.
4. Confirm whether the product vocabulary should use `financialSummary` or `financials` before an API or database contract is created.
5. Decide whether ownership is one record or a list of contact-linked relationship records.
6. Add runtime validators and focused tests for ranges, timestamps, contact reachability, and ownership percentages when API boundaries land.
7. Use `docs/type-safety/verification-checklist.md` as the acceptance gate when types change.

## Evidence links

- Domain brief: `docs/domain/investor-listing-domain-brief.md`
- Field inventory: `docs/domain/listing-field-inventory.md`
- Expected compile errors: `docs/type-safety/expected-type-errors.md`
- Verification checklist: `docs/type-safety/verification-checklist.md`
- Types entrypoint: `src/types/index.ts`
