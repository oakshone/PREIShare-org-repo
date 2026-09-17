# Sprint 2 Topic 1 - Types Handoff: PREIshare Investor Listings

**Audience:** next sprint topic owners, PREIshare engineering, and product partners  
**Status:** Topic 1 (TypeScript foundations) complete; implementation topics not started  
**Date:** 2026-09-17

## 1. Client story recap

- PREIShare needs one shared, trustworthy investor-listing shape before building forms, routes, APIs, or persistence.
- This topic addresses early mistakes such as missing listing information and inconsistent status or property-type values.
- The result is groundwork for future product workflows, not a finished investor feature.

## 2. What we shipped this topic

| Deliverable | Path | Why it matters |
| --- | --- | --- |
| Domain brief and field inventory | `docs/domain/` | Business rules are recorded before code changes. |
| Types package barrel | `src/types/index.ts` | One import surface for `InvestorListing` and related types. |
| Core, nested, and relationship types | `src/types/*.ts` | Defines interfaces, unions, nested objects, contacts, and ownership. |
| Valid fixtures | `src/fixtures/sample-investor-listings.ts` | Shows that good listings type-check across all statuses. |
| Invalid cases and expected errors | `src/fixtures/invalid-listings.errors.ts`, `docs/type-safety/expected-type-errors.md` | Shows that known bad data is rejected. |
| Typecheck script and checklist | `package.json`, `tsconfig.json`, `src/types/package.json`, `docs/type-safety/verification-checklist.md` | Provides repeatable clean and scoped checks. |
| Decision record | `docs/decisions/ADR-001-investor-listing-types.md` | Explains the type decisions for product and engineering review. |

**How to verify locally:** follow `docs/type-safety/verification-checklist.md` and run `npm run typecheck` from the project root. The valid sources must pass; `src/fixtures/invalid-listings.errors.ts` is intentionally excluded from the clean gate and must fail when checked separately as documented.

## 3. What we must NOT claim is done yet

- No TanStack Start UI or listing forms are built or wired to these types.
- No Supabase/PostgreSQL tables, migrations, or pgvector work has been implemented from this model.
- No HTTP API routes, request/response validation at the network boundary, or auth rules exist for listings.
- No runtime schema library is required by this topic.
- No production deployment of listing create/edit flows exists.
- TypeScript does not currently validate email, date, or currency formats; numeric ranges; non-empty strings; or whether `primaryContactId` exists in `contacts`.

If a demo only shows green typecheck on fixtures, say: **"the data model is typed and verified; product surfaces are next."**

## 4. Next sprint pickups (use the types - do not reinvent them)

### A. TanStack Start forms (UI)

- Build create/edit forms using field names from `InvestorListing` and nested types imported from `src/types/index.ts`.
- Use `ListingStatus` and `PropertyType` for status/category choices instead of copying string literals into components.
- Use `src/fixtures/sample-investor-listings.ts` as realistic form defaults and examples.
- Acceptance sketch: a form cannot submit a status or property type outside the shared unions without a type or validation failure during development.

### B. Supabase/PostgreSQL schema alignment (data)

- Map database columns and related tables to `InvestorListing`, `Address`, `FinancialSummary`, `InvestorContact`, and `Ownership` from `src/types/index.ts`.
- Preserve the shared status and property-type vocabulary in database constraints; do not create alternate spellings.
- Document any intentional difference between TypeScript optional fields and database NULL rules in a follow-up ADR.
- Plan contacts, ownership, timestamps, and status history from the same domain brief that drove the types.
- Acceptance sketch: data that would fail `InvestorListing` assignment is also rejected by database constraints or insert validation.

### C. API boundaries (server)

- Define list/get/create/update request and response shapes by importing or composing types from `src/types/index.ts`, rather than using anonymous JSON shapes.
- Keep write endpoints aligned with `ListingStatus` and `PropertyType`; do not widen them back to plain `string`.
- Add runtime validation at the boundary for formats, ranges, contact reachability, and cross-field rules that TypeScript cannot enforce.
- Use the valid samples as accepted payload evidence and the intentional invalid cases as rejected payload evidence.
- Acceptance sketch: API handlers do not accept a free-form status string without an explicit, documented exception.

```text
Client pain (loose JSON)
	|
	v
Domain brief + field inventory
	|
	v
Strict TS types + fixtures + typecheck + ADR-001   <-- you are here
	|
	+--> TanStack Start forms (UI)
	+--> Supabase/PostgreSQL schema (data)
	+--> API routes and validation (boundary)
```

## 5. Prompting and review self-assessment

- **Prompting habit that helped:** I grounded changes in the domain brief, field inventory, current type names, fixtures, and fresh compiler output.
- **Second prompting habit that helped:** I kept intentional invalid examples outside the clean typecheck and documented their expected failures separately.
- **Review habit that caught an agent mistake:** I checked the actual file scope and current vocabulary before accepting root versus `src/types` typecheck changes.
- **What I would do differently next topic:** Confirm exact target files and resolve naming mismatches before expanding fixtures or documentation.
- **Confidence (1-5) explaining `InvestorListing` to a teammate:** 4; the model and checks are clear, while ownership and draft optionality still need product decisions.

## 6. Handoff checklist for the next owner

- [ ] Read ADR-001 and this handoff before opening a UI or SQL PR.
- [ ] Import listing types from `src/types/index.ts` rather than redefining them.
- [ ] Keep `npm run typecheck` green for valid project sources.
- [ ] Do not delete `src/fixtures/invalid-listings.errors.ts`; it documents type-safety evidence.
- [ ] File a new ADR if product changes allowed statuses or required fields.
