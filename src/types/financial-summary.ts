export interface FinancialSummary {
  /** Listed price amount. */
  askingPrice: number;

  /** Currency code for the asking price. */
  currency: string;

  /** Optional projected internal rate of return. */
  projectedIrrPercent?: number;

  /** Optional capitalization rate. */
  capRatePercent?: number;
}
