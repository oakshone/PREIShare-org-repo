import type { Address } from './address';
import type { InvestorContact } from './investor-contact';
import type { FinancialSummary } from './financial-summary';
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

  /** Investor contacts associated with the listing. */
  contacts: InvestorContact[];

  /** Primary contact for the listing. */
  primaryContactId: string;

  /** Ownership relationships tied to listing contacts. */
  ownership: Ownership[];

  /** Timestamp for when the listing record was created. */
  createdAt: string;

  /** Timestamp for the listing's last meaningful edit. */
  updatedAt: string;
}
