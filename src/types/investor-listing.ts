import type { Address } from './address';
import type { FinancialSummary } from './financial-summary';

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

  /** Timestamp for when the listing record was created. */
  createdAt: string;

  /** Timestamp for the listing's last meaningful edit. */
  updatedAt: string;
}
