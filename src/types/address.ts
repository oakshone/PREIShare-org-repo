export interface Address {
  /** Street number and street name. */
  line1: string;

  /** Unit, suite, apartment, or secondary location line. */
  line2?: string;

  /** City or locality. */
  city: string;

  /** State, province, or region. */
  region: string;

  /** Postal or ZIP code. */
  postalCode: string;

  /** Country code or name. */
  country: string;
}
