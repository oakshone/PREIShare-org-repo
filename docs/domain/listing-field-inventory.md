# Listing Field Inventory

This inventory describes the proposed minimum field contract for a listing. It is a domain-level inventory, not a database schema or TypeScript type. `Required` means required for a valid submitted listing unless noted otherwise; draft records may be incomplete.

The `address` and `financials` groups must be represented as nested objects; their child fields must not be flattened into listing-level fields. `contacts` must be represented as a list. For investor-visible statuses (`published`, `under_offer`, and `sold`), `contacts` must contain at least one entry.

## Identity

| Field name | Meaning | Shape | Required vs optional | Example |
| --- | --- | --- | --- | --- |
| `id` | Stable identifier for the listing. | text | Required | `"lst_01J8Q2"` |
| `title` | Short human-readable name for the listing. | text | Required | `"Community garden plot"` |
| `propertyType` | Controlled category describing the property. | fixed choice | Required | `"multifamily"` |
| `ownerId` | Stable reference to the primary lister or owning organization. | text | Required | `"org_0142"` |
| `status` | Current value from the closed listing lifecycle. | fixed choice | Required | `"published"` |
| `createdAt` | System-recorded creation time. | datetime | Required | `"2026-09-13T14:30:00Z"` |
| `updatedAt` | System-recorded last-update time. | datetime | Required | `"2026-09-13T15:05:00Z"` |

`propertyType` and `status` must use controlled values. The allowed property types are `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, and `land`. The allowed status values are `draft`, `published`, `under_offer`, `sold`, and `archived`, as defined in the domain brief. Free-text status values are forbidden.

## Address

`address` is a required object group for investor-visible listings and an optional object group while a listing is in `draft`. Its child fields may vary by property type, but a published listing needs enough location information for an interested party to understand where the listing applies without exposing an unnecessarily precise private address.

| Field name | Meaning | Shape | Required vs optional | Example |
| --- | --- | --- | --- | --- |
| `address` | Location details for the listing. | nested object | Required for investor-visible statuses; optional in `draft` | `{ "city": "Portland", "region": "OR", "country": "US" }` |
| `address.line1` | Primary street or location line. | text | Optional | `"1200 SE Division St"` |
| `address.line2` | Unit, suite, building, or secondary location line. | text | Optional | `"Building B"` |
| `address.city` | City or locality. | text | Required for location-specific listings | `"Portland"` |
| `address.region` | State, province, or region. | text | Optional | `"OR"` |
| `address.postalCode` | Postal or ZIP code. | text | Optional | `"97202"` |
| `address.country` | Country code or controlled country value. | fixed choice | Required when an address is supplied | `"US"` |

## Financials

`financials` is a nested object group for amount and currency information that helps an interested party understand the financial terms. Its child fields must remain inside the object; it must not be flattened or used to imply that payment processing exists.

| Field name | Meaning | Shape | Required vs optional | Example |
| --- | --- | --- | --- | --- |
| `financials` | Financial terms associated with the listing. | nested object | Optional object group | `{ "currency": "USD", "amount": 25, "frequency": "one_time" }` |
| `financials.currency` | Currency for monetary values. | fixed choice | Required when any amount is supplied | `"USD"` |
| `financials.amount` | Primary amount associated with the listing. | number | Optional | `25` |
| `financials.frequency` | Recurrence or timing of the amount. | fixed choice | Required when `amount` is supplied | `"one_time"` |
| `financials.estimatedValue` | Non-binding estimated value when a direct amount is not appropriate. | number | Optional | `1500` |
| `financials.notes` | Plain-language explanation of financial terms or exclusions. | text | Optional | `"Materials are provided at no charge."` |

The initial fixed choices for `financials.frequency` are `one_time`, `daily`, `weekly`, `monthly`, `annual`, and `not_applicable`. Product owners should confirm whether financials are relevant to every `propertyType` before implementation.

## Contacts

`contacts[]` is a list of contact records. It must contain at least one entry when `status` is `published`, `under_offer`, or `sold`; it may be empty or omitted in `draft`. A listing should expose only the contact details needed for the next handoff, and private contact values should not be public by default.

| Field name | Meaning | Shape | Required vs optional | Example |
| --- | --- | --- | --- | --- |
| `contacts` | Contact records associated with the listing. | list | Required; at least one for `published`, `under_offer`, or `sold` | `[{ "type": "email", "value": "hello@example.org" }]` |
| `contacts[].type` | Kind of contact channel. | fixed choice | Required | `"email"` |
| `contacts[].value` | Address, number, or handle for the channel. | text | Required | `"hello@example.org"` |
| `contacts[].label` | Human-readable label for the contact. | text | Optional | `"Project coordinator"` |
| `contacts[].availability` | When the contact can normally be reached. | text | Optional | `"Weekdays, 9:00-17:00 Pacific"` |
| `contacts[].visibility` | Audience allowed to see the contact. | fixed choice | Required | `"interested_parties"` |

The initial fixed choices for `contacts[].type` are `email`, `phone`, `web`, and `other`. The initial fixed choices for `contacts[].visibility` are `public`, `interested_parties`, and `private`.

## Ownership

`ownership[]` is a list of parties with a recognized relationship to the listing. It supports shared or organizational ownership without making ownership assumptions part of the listing title or description.

| Field name | Meaning | Shape | Required vs optional | Example |
| --- | --- | --- | --- | --- |
| `ownership` | Parties associated with ownership or stewardship of the listing. | list | Required; at least one record | `[{ "partyId": "org_0142", "role": "owner" }]` |
| `ownership[].partyId` | Stable reference to a person or organization. | text | Required | `"org_0142"` |
| `ownership[].displayName` | Name shown when a resolved party reference is available. | text | Optional | `"Eastside Community Group"` |
| `ownership[].role` | Controlled relationship of the party to the listing. | fixed choice | Required | `"owner"` |
| `ownership[].share` | Numeric ownership or responsibility proportion, when applicable. | number | Optional | `100` |
| `ownership[].notes` | Short explanation of the party's role or responsibility. | text | Optional | `"Coordinates access and scheduling."` |

The initial fixed choices for `ownership[].role` are `owner`, `co_owner`, `steward`, and `administrator`. If `share` is used, product rules must define whether it is a percentage, fraction, or another unit; the example assumes a percentage from `0` to `100`.

## Validation handoff

Before implementation, confirm whether address and financials are required for each `propertyType`, whether a listing may have multiple owners, and which contact visibility rules apply. These decisions should become route-level validation and tests before the fields are persisted or exposed through an API.
