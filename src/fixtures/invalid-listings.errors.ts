import type { InvestorListing } from '../types';

/** Error: status must use one of the closed ListingStatus values. */
export const invalidStatusListing = {
  id: 'invalid-status-001',
  title: 'Invalid Status Example',
  summary: 'This fixture uses a status outside the allowed union.',
  status: 'active',
  propertyType: 'land',
  address: {
    line1: '10 Example Street',
    city: 'Austin',
    region: 'TX',
    postalCode: '78701',
    country: 'US',
  },
  financialSummary: {
    askingPrice: 1000000,
    currency: 'USD',
  },
  contacts: [],
  primaryContactId: '',
  ownership: {
    ownerName: 'Example Holdings LLC',
  },
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-01T10:00:00Z',
} satisfies InvestorListing;

/** Error: propertyType must use one of the approved domain categories. */
export const invalidPropertyTypeListing = {
  id: 'invalid-property-type-001',
  title: 'Invalid Property Type Example',
  summary: 'This fixture uses a property category outside the allowed union.',
  status: 'draft',
  propertyType: 'commercial',
  address: {
    line1: '15 Example Street',
    city: 'Austin',
    region: 'TX',
    postalCode: '78701',
    country: 'US',
  },
  contacts: [],
  primaryContactId: '',
  ownership: {
    ownerName: 'Example Holdings LLC',
  },
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-01T10:00:00Z',
} satisfies InvestorListing;

/** Error: a sold listing must include closedAt. */
export const soldListingWithoutClosedAt = {
  id: 'invalid-sold-001',
  title: 'Sold Without Close Date',
  summary: 'This sold listing is missing its required close timestamp.',
  status: 'sold',
  propertyType: 'land',
  address: {
    line1: '20 Example Road',
    city: 'Dallas',
    region: 'TX',
    postalCode: '75201',
    country: 'US',
  },
  financialSummary: {
    askingPrice: 750000,
    currency: 'USD',
  },
  contacts: [
    {
      id: 'contact-invalid-sold-001',
      fullName: 'Casey Morgan',
      role: 'owner',
      email: 'casey.morgan@example.com',
    },
  ],
  primaryContactId: 'contact-invalid-sold-001',
  ownership: {
    ownerName: 'Example Land LLC',
  },
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-01T10:00:00Z',
} satisfies InvestorListing;

/** Error: a published listing needs a financial summary. */
export const publishedListingWithoutFinancialSummary = {
  id: 'invalid-published-001',
  title: 'Published Without Financials',
  summary: 'This published listing omits required financial data.',
  status: 'published',
  propertyType: 'retail',
  address: {
    line1: '30 Example Boulevard',
    city: 'Houston',
    region: 'TX',
    postalCode: '77002',
    country: 'US',
  },
  contacts: [
    {
      id: 'contact-invalid-published-001',
      fullName: 'Jamie Lee',
      role: 'broker',
      email: 'jamie.lee@example.com',
    },
  ],
  primaryContactId: 'contact-invalid-published-001',
  ownership: {
    ownerName: 'Example Commercial LLC',
  },
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-01T10:00:00Z',
} satisfies InvestorListing;

/** Error: financial amounts and percentages must be numbers. */
export const listingWithStringFinancialMetric = {
  id: 'invalid-financial-001',
  title: 'String Financial Metric',
  summary: 'This fixture uses text for a numeric financial field.',
  status: 'under_offer',
  propertyType: 'office',
  address: {
    line1: '40 Example Avenue',
    city: 'Denver',
    region: 'CO',
    postalCode: '80202',
    country: 'US',
  },
  financialSummary: {
    askingPrice: 'not-a-number',
    currency: 'USD',
  },
  contacts: [
    {
      id: 'contact-invalid-financial-001',
      fullName: 'Riley Chen',
      role: 'owner_rep',
      email: 'riley.chen@example.com',
    },
  ],
  primaryContactId: 'contact-invalid-financial-001',
  ownership: {
    ownerName: 'Example Offer LLC',
  },
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-01T10:00:00Z',
} satisfies InvestorListing;
