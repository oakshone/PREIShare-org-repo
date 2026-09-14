export interface InvestorListing {
  /** Stable unique identifier for the listing. */
  id: string;

  /** Short name shown to investors. */
  title: string;

  /** Investor-facing summary, required before the listing is visible. */
  description?: string;

  /** Timestamp for when the listing record was created. */
  createdAt: string;

  /** Timestamp for the listing's last meaningful edit. */
  updatedAt: string;
}
