import type { Address } from './address';
import type { FinancialSummary } from './financial-summary';
import type { InvestorContact } from './investor-contact';
import type { Ownership } from './ownership';

export interface InvestorListing {
  /** Stable unique identifier for the listing. */
  id: string;

  /** Short name shown to investors. */
  title: string;

  /** Investor-facing summary of the listing. */
  summary: string;

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
  createdAt: string;

  /** Timestamp for the listing's last meaningful edit. */
  updatedAt: string;
}
