import type { ContactId } from './investor-contact';

export type OwnershipRelationship =
  | 'primary_owner'
  | 'co_owner'
  | 'broker'
  | 'property_manager';

export interface Ownership {
  /** Contact that the ownership row refers to, either by name or by contact id. */
  contactNameOrId: string;

  /** Reference to a known contact when the contact id is available. */
  contactId?: ContactId;

  /** Relationship between the contact and the asset. */
  relationship: OwnershipRelationship;

  /** Optional percentage ownership share. */
  sharePercent?: number;

  /** Optional notes about the ownership arrangement. */
  notes?: string;
}
