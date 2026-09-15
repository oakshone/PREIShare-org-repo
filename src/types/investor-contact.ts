export type ContactId = string & { readonly __brand: 'ContactId' };

export type ContactRole =
  | 'broker'
  | 'owner_rep'
  | 'property_manager'
  | 'advisor';

export interface InvestorContact {
  /** Stable contact identifier. */
  id: ContactId;

  /** Person or firm name. */
  name: string;

  /** Why this contact appears on the listing. */
  role: ContactRole;

  /** Email channel when used. */
  email?: string;

  /** Phone channel when used. */
  phone?: string;
}
