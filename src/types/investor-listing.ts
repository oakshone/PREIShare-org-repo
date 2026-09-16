import type { Address } from './address';
import type { FinancialSummary } from './financial-summary';
import type { InvestorContact } from './investor-contact';
import type { Ownership } from './ownership';
import type { PropertyType } from './property-type';

/** Fields every investor listing has, regardless of status. */
export interface InvestorListingBase {
  /** Stable unique identifier for the listing. */
  readonly id: string;

  /** Short name shown to investors. */
  title: string;

  /** Investor-facing summary of the listing. */
  summary: string;

  /** Controlled property category for the listing. */
  propertyType: PropertyType;

  /** Physical location for the listing. */
  address: Address;

  /** Financial summary for the listing. */
  financialSummary?: FinancialSummary;

  /** One or more people associated with this listing. */
  contacts: InvestorContact[];

  /**
   * Must match InvestorContact.id of one entry in `contacts`.
   * TypeScript cannot fully enforce "id exists in array" alone;
   * we still type it as string so callers pass an id, not a whole loose object.
   */
  primaryContactId: string;

  /** Ownership information for the listing. */
  ownership: Ownership;

  /** Timestamp for when the listing record was created. */
  readonly createdAt: string;

  /** Timestamp for the listing's last meaningful edit. */
  readonly updatedAt: string;
}

/** The status field is the discriminant: its literal value selects one branch. */
export type InvestorListing =
  | DraftInvestorListing
  | PublishedInvestorListing
  | UnderOfferInvestorListing
  | SoldInvestorListing
  | ArchivedInvestorListing;

export interface DraftInvestorListing extends InvestorListingBase {
  status: 'draft';
  /** Only present on the closed-equivalent sold branch. */
  closedAt?: undefined;
}

export interface PublishedInvestorListing extends InvestorListingBase {
  status: 'published';
  financialSummary: FinancialSummary;
  contacts: [InvestorContact, ...InvestorContact[]];
  /** Only present on the closed-equivalent sold branch. */
  closedAt?: undefined;
}

export interface UnderOfferInvestorListing extends InvestorListingBase {
  status: 'under_offer';
  financialSummary: FinancialSummary;
  contacts: [InvestorContact, ...InvestorContact[]];
  /** Only present on the closed-equivalent sold branch. */
  closedAt?: undefined;
}

export interface SoldInvestorListing extends InvestorListingBase {
  status: 'sold';
  financialSummary: FinancialSummary;
  contacts: [InvestorContact, ...InvestorContact[]];
  /** ISO date string required when the listing is sold. */
  closedAt: string;
}

export interface ArchivedInvestorListing extends InvestorListingBase {
  status: 'archived';
  /** Only present on the closed-equivalent sold branch. */
  closedAt?: undefined;
}

export type ClosedInvestorListing = SoldInvestorListing;
export type OpenInvestorListing = Exclude<InvestorListing, SoldInvestorListing>;
