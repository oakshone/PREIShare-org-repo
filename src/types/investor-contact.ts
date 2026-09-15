/** A person the team can reach about an investor listing. */
export interface InvestorContact {
  /** Stable id within the listing's contact list (string is fine for now). */
  id: string;

  /** Full name of the contact. */
  fullName: string;

  /** Role relative to the deal, e.g. "broker", "owner", "assistant". */
  role: string;

  /** Email address for the contact. */
  email: string;

  /** Optional — not every contact shares a phone. */
  phone?: string;
}
