import type { ListingStatus } from "./listing-status";
import type { PropertyType } from "./property-type";

export interface InvestorListing {
  /** Stable unique identifier for the listing. */
  id: string;

  /** Short name shown to investors. */
  title: string;

  /** Controlled lifecycle status for the listing. */
  status: ListingStatus;

  /** Controlled property category for the listing. */
  propertyType: PropertyType;

  /** Investor-facing summary, required before the listing is visible. */
  description?: string;

  /** Timestamp for when the listing record was created. */
  createdAt: string;

  /** Timestamp for the listing's last meaningful edit. */
  updatedAt: string;
}
