// Closed set of lifecycle states from the domain brief.
// Only these exact strings are allowed; no free text.
export type ListingStatus =
  | "draft"
  | "published"
  | "under_offer"
  | "sold"
  | "archived";
