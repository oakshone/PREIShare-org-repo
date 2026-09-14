# Investor Listing Domain Brief (PREIshare)

## Purpose

Define what an investor listing is in PREIshare business language so TypeScript types in later steps match real workflows—not invented fields.

## Actors

- **Listing editor (internal ops)** — creates and updates listings before investors see them.
- **Investor (end user)** — browses published listings and relies on complete, consistent data.
- **Reviewer / compliance** — checks that status, price, and contact info are trustworthy before publish.
- **Future systems** — website UI, API, and database will all read the same listing shape.

## Business goals

- One shared definition of a listing across screens and teammates.
- Catch missing or invalid data before production (at compile time once types exist).
- Support nested real-world data: address, financial summary, investor contacts, ownership.

## Listing lifecycle statuses (allowed values only)

- `draft` — internal only; not visible to investors.
- `published` — visible to investors; must meet full validity rules.
- `under_offer` — active interest; still structured like a published listing.
- `sold` — closed deal; retained for history.
- `archived` — removed from active browse; not deleted.

## Nested data groups

- **Address** — street line(s), city, region/state, postal code, country.
- **Financial summary** — asking price, currency, optional projected return metrics the team agrees to track.
- **Investor contacts** — one or more people tied to the listing (name, role, email or phone).
- **Ownership** — how contacts relate to the asset (e.g., primary owner, co-owner, broker) and optional ownership share.

## Core identity fields (high level)

- Stable listing id
- Human-readable title
- Property type (fixed set, e.g. multifamily, office, retail, industrial, mixed_use, land)
- Status (from the lifecycle list above)
- Short description for investors
- Created/updated timestamps (as business concepts; format decided later)

## Success criteria — “a valid investor listing”

1. Has a non-empty id and title.
2. Status is exactly one of the allowed lifecycle values (no free-text variants).
3. Property type is exactly one of the allowed property-type values.
4. Address includes enough fields to locate the property (street, city, region/state, postal code, country).
5. Financial summary includes a numeric asking price and a currency code.
6. At least one investor contact with a name and a reachable channel (email or phone).
7. Ownership relationship for each contact is from an agreed fixed set (not free text).
8. Optional fields may be absent; required fields above must never be missing for `published`, `under_offer`, or `sold`.

## Out of scope for this topic

- Building UI forms, API routes, or database tables.
- Authentication, payments, or document uploads.
- Exact TypeScript syntax (comes in later steps).

## Handoff note

Later steps must implement types that honor this brief and the companion field inventory. If a type allows a status or field not listed here, the type is wrong.

---

# Listing Field Inventory (PREIshare)

Use this table as the source of truth when defining TypeScript types. Field names are suggestions the types may adopt; meanings and shapes are mandatory.

## Identity and classification

| Field | Meaning | Shape | Required? | Example / allowed values |
| --- | --- | --- | --- | --- |
| id | Stable unique id for the listing | text | yes | `lst_ev_1001` |
| title | Short name shown to investors | text | yes | `Riverfront Multifamily Offering` |
| description | Longer investor-facing summary | text | yes for published+ | `Value-add asset near transit...` |
| status | Lifecycle state | fixed choice | yes | `draft`, `published`, `under_offer`, `sold`, `archived` |
| propertyType | Asset class | fixed choice | yes | `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, `land` |
| createdAt | When the listing record was created | datetime text | yes | `2026-03-01T10:00:00Z` |
| updatedAt | Last meaningful edit | datetime text | yes | `2026-03-15T16:30:00Z` |

## Address (nested object)

| Field | Meaning | Shape | Required? | Example |
| --- | --- | --- | --- | --- |
| address.line1 | Street number and name | text | yes | `500 River Rd` |
| address.line2 | Unit/suite (if any) | text | no | `Suite 200` |
| address.city | City | text | yes | `Austin` |
| address.region | State/province/region | text | yes | `TX` |
| address.postalCode | Postal code | text | yes | `78701` |
| address.country | Country code or name | text | yes | `US` |

## Financial summary (nested object)

| Field | Meaning | Shape | Required? | Example |
| --- | --- | --- | --- | --- |
| financials.askingPrice | Listed price amount | number | yes | `12500000` |
| financials.currency | Currency code | fixed choice / text code | yes | `USD` |
| financials.projectedIrrPercent | Optional projected IRR | number | no | `12.5` |
| financials.capRatePercent | Optional cap rate | number | no | `5.8` |

## Investor contacts (list of nested objects)

| Field | Meaning | Shape | Required? | Example |
| --- | --- | --- | --- | --- |
| contacts[].name | Person or firm name | text | yes (each contact) | `Jordan Lee` |
| contacts[].role | Why they appear on the listing | fixed choice or text | yes | `broker`, `owner_rep` |
| contacts[].email | Email if used | text | one of email/phone required | `jordan@example.com` |
| contacts[].phone | Phone if used | text | one of email/phone required | `+1-512-555-0142` |

## Ownership (nested object or list tied to contacts)

| Field | Meaning | Shape | Required? | Example |
| --- | --- | --- | --- | --- |
| ownership[].contactNameOrId | Which contact the row refers to | text | yes | `Jordan Lee` or contact id |
| ownership[].relationship | Relationship to the asset | fixed choice | yes | `primary_owner`, `co_owner`, `broker`, `property_manager` |
| ownership[].sharePercent | Optional ownership share | number | no | `60` |

## Inventory rules (must hold)

1. Do not invent extra top-level groups beyond identity, address, financials, contacts, and ownership without updating the domain brief.
2. Status and propertyType must remain closed lists (union candidates)—never free text.
3. Address and financials are nested objects, not flat optional strings only.
4. Contacts are a list (array); a valid published listing needs at least one contact.
5. Every required field above must appear in later TypeScript interfaces unless the decision record deliberately relaxes it.
