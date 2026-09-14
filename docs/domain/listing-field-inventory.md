# Listing Field Inventory

This inventory describes the proposed minimum field contract for a listing. It is a domain-level inventory, not a database schema or TypeScript type. `Required` means required for a valid submitted listing unless noted otherwise; draft records may be incomplete.

The `address` and `financials` groups must be represented as nested objects; their child fields must not be flattened into listing-level fields. `contacts` must be represented as a list. For investor-visible statuses (`published`, `under_offer`, and `sold`), `contacts` must contain at least one entry.

## Identity

| Field name | Meaning | Shape | Required vs optional | Example |
| --- | --- | --- | --- | --- |
| `id` | Stable identifier for the listing. | text | Required | `"lst_01J8Q2"` |
| `title` | Short human-readable name for the listing. | text | Required | `"Community garden plot"` |
| `description` | Investor-facing summary of the property opportunity. | text | Required for investor-visible statuses | `"Value-add asset near transit."` |
| `propertyType` | Controlled category describing the property. | fixed choice | Required | `"multifamily"` |
| `status` | Current value from the closed listing lifecycle. | fixed choice | Required | `"published"` |
| `createdAt` | When the listing record was created. | datetime text | Required | `"2026-03-01T10:00:00Z"` |
| `updatedAt` | Last meaningful edit to the listing. | datetime text | Required | `"2026-03-15T16:30:00Z"` |

`propertyType` and `status` must use controlled values. The allowed property types are `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, and `land`. The allowed status values are `draft`, `published`, `under_offer`, `sold`, and `archived`, as defined in the domain brief. Free-text status values are forbidden.

## Address

`address` is a required object group for investor-visible listings and an optional object group while a listing is in `draft`. For a valid investor-visible listing, the location must include the street, city, region, postal code, and country.

| Field name | Meaning | Shape | Required vs optional | Example |
| --- | --- | --- | --- | --- |
| `address` | Location details for the listing. | nested object | Required for investor-visible statuses; optional in `draft` | `{ "city": "Portland", "region": "OR", "country": "US" }` |
| `address.line1` | Street number and name. | text | Required for investor-visible statuses | `"500 River Rd"` |
| `address.line2` | Unit, suite, building, or secondary location line. | text | Optional | `"Building B"` |
| `address.city` | City or locality. | text | Required for investor-visible statuses | `"Austin"` |
| `address.region` | State, province, or region. | text | Required for investor-visible statuses | `"TX"` |
| `address.postalCode` | Postal code. | text | Required for investor-visible statuses | `"78701"` |
| `address.country` | Country code or name. | text | Required for investor-visible statuses | `"US"` |

## Financials

`financials` is a required nested object group for investor-visible listings. Its child fields must remain inside the object; it must not be flattened or used to imply that payment processing exists.

| Field name | Meaning | Shape | Required vs optional | Example |
| --- | --- | --- | --- | --- |
| `financials` | Financial summary for the listing. | nested object | Required for investor-visible statuses | `{ "askingPrice": 12500000, "currency": "USD" }` |
| `financials.askingPrice` | Listed price amount. | number | Required for investor-visible statuses | `12500000` |
| `financials.currency` | Currency code for the asking price. | fixed choice / text code | Required for investor-visible statuses | `"USD"` |
| `financials.projectedIrrPercent` | Optional projected internal rate of return. | number | Optional | `12.5` |
| `financials.capRatePercent` | Optional capitalization rate. | number | Optional | `5.8` |

The currency value must be a valid currency code. Product owners should confirm the allowed currency set before implementation.

## Contacts

`contacts[]` is a list of investor contact records. It must contain at least one entry when `status` is `published`, `under_offer`, or `sold`; it may be empty or omitted in `draft`. Every contact must have a name, role, and at least one reachable channel.

| Field name | Meaning | Shape | Required vs optional | Example |
| --- | --- | --- | --- | --- |
| `contacts` | Investor contact records associated with the listing. | list | Required; at least one for `published`, `under_offer`, or `sold` | `[{ "name": "Jordan Lee", "role": "broker", "email": "jordan@example.com" }]` |
| `contacts[].name` | Person or firm name. | text | Required for each contact | `"Jordan Lee"` |
| `contacts[].role` | Why the person or firm appears on the listing. | fixed choice or text | Required for each contact | `"broker"` |
| `contacts[].email` | Email channel, when used. | text | One of `email` or `phone` required | `"jordan@example.com"` |
| `contacts[].phone` | Phone channel, when used. | text | One of `email` or `phone` required | `"+1-512-555-0142"` |

Contact data should expose only the details needed for the investor handoff; private contact information should not be public by default.

## Ownership

`ownership[]` is a list of ownership relationships tied to listing contacts. It explains how each contact relates to the asset.

| Field name | Meaning | Shape | Required vs optional | Example |
| --- | --- | --- | --- | --- |
| `ownership` | Ownership relationships tied to listing contacts. | list | Required for investor-visible listings | `[{ "contactNameOrId": "Jordan Lee", "relationship": "primary_owner" }]` |
| `ownership[].contactNameOrId` | Contact that the ownership row refers to. | text | Required | `"Jordan Lee"` or contact id |
| `ownership[].relationship` | Fixed relationship between the contact and the asset. | fixed choice | Required | `"primary_owner"` |
| `ownership[].sharePercent` | Optional ownership share. | number | Optional | `60` |

The allowed ownership relationships are `primary_owner`, `co_owner`, `broker`, and `property_manager`. Ownership relationships must not be free text.

## Validation handoff

The investor brief and this inventory now use the same required fields and nested shapes. Before implementation, confirm whether contact roles are also a closed set and which currency codes are allowed. These decisions should become route-level validation and tests before the fields are persisted or exposed through an API.
