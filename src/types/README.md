# PREIshare investor listing types

This folder holds **shared TypeScript types** for PREIshare investor listings.

## Why this exists

Loose objects and ad-hoc JSON let bad data reach production (missing price,
status spelled three ways, nested address fields that vanish on one screen).
These types catch those mistakes at **compile time**—before users see them.

## What belongs here

- Domain type modules only (listing, address, status, contacts, etc.)
- No UI components, no API route handlers, no database clients

## Typecheck

From the repository root:

```bash
npm --prefix src/types run typecheck
```

Or from this folder:

```bash
npm run typecheck
```

That runs `tsc --noEmit`: TypeScript checks the files under this folder and
reports errors without writing JavaScript output files.

Valid sources include `src/types/**` and the valid sample fixture at
`src/fixtures/sample-investor-listings.ts` when it is checked separately.

### What success looks like

If the check passes, the command exits with code 0 and reports no TypeScript
errors. That means the shared type files in this folder agree with one another.
No JavaScript files are created.

### Intentional error examples

The file `src/fixtures/invalid-listings.errors.ts` is outside this package on
purpose. It contains examples that should fail, such as an invalid status or a
sold listing without `closedAt`, so it is not part of the normal command above.

To inspect those teaching errors separately from the repository root, run:

```bash
npx tsc --ignoreConfig --noEmit --strict --target ES2020 --module ESNext \
	--moduleResolution bundler --skipLibCheck \
	src/fixtures/invalid-listings.errors.ts
```

That command is expected to exit with an error and print the documented
diagnostics. A failing result there is intentional; a failing result from
`npm --prefix src/types run typecheck` means the shared types need attention.

## Strict mode (plain language)

`strict: true` in `tsconfig.json` turns on the checker's safest rules. Combined
with flags like `noUncheckedIndexedAccess`, it refuses incomplete or loosely
typed data so the team can trust shared listing models.

## Source of truth

Business vocabulary and field rules come from:
`docs/domain/investor-listing-domain-brief.md`

The companion field inventory is included in that brief and defines the
required nested address, financials, contacts, and ownership shapes.
