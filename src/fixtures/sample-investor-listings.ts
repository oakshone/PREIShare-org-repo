import type { InvestorListing } from '../types';

/** Published commercial listing with full nested shapes. */
export const samplePublishedListing: InvestorListing = {
  id: 'listing-001',
  title: 'Riverfront Commercial Workshop',
  summary: 'A furnished workshop available for community projects.',
  status: 'published',
  propertyType: 'mixed_use',
  address: {
    line1: '1200 River Road',
    line2: 'Suite 100',
    city: 'Austin',
    region: 'TX',
    postalCode: '78701',
    country: 'US',
  },
  financialSummary: {
    askingPrice: 4250000,
    projectedIrrPercent: 7.3,
    capRatePercent: 7.3,
    currency: 'USD',
  },
  contacts: [
    {
      id: 'contact-001',
      fullName: 'Jordan Lee',
      email: 'jordan.lee@example.com',
      phone: '+1-512-555-0142',
      role: 'broker',
    },
  ],
  primaryContactId: 'contact-001',
  ownership: {
    ownerName: 'PREI Riverfront Holdings LLC',
    ownershipPercent: 100,
  },
  createdAt: '2026-08-01T09:00:00Z',
  updatedAt: '2026-09-05T11:15:00Z',
};

/** Draft listing still being prepared. */
export const sampleDraftListing: InvestorListing = {
  id: 'listing-002',
  title: 'Draft Oak Street Land Parcel',
  summary: 'A land listing still being prepared for review.',
  status: 'draft',
  propertyType: 'land',
  address: {
    line1: '88 Oak Street',
    city: 'Dallas',
    region: 'TX',
    postalCode: '75201',
    country: 'US',
  },
  contacts: [],
  primaryContactId: '',
  ownership: {
    ownerName: 'PREI Draft Vehicles LLC',
    ownershipPercent: 100,
  },
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-02T14:30:00Z',
};

/** Under-offer listing exercising the under_offer status branch. */
export const sampleUnderOfferListing: InvestorListing = {
  id: 'listing-003',
  title: 'Cedar Commercial Site Under Offer',
  summary: 'A commercial site with an active offer under review.',
  status: 'under_offer',
  propertyType: 'retail',
  address: {
    line1: '4500 Cedar Boulevard',
    city: 'Houston',
    region: 'TX',
    postalCode: '77002',
    country: 'US',
  },
  financialSummary: {
    askingPrice: 6100000,
    projectedIrrPercent: 7.5,
    capRatePercent: 7.5,
    currency: 'USD',
  },
  contacts: [
    {
      id: 'contact-002',
      fullName: 'Sam Rivera',
      email: 'sam.rivera@example.com',
      role: 'owner_rep',
    },
  ],
  primaryContactId: 'contact-002',
  ownership: {
    ownerName: 'PREI Cedar JV',
    ownershipPercent: 60,
  },
  createdAt: '2026-07-10T13:20:00Z',
  updatedAt: '2026-09-07T16:45:00Z',
};

/** Sold listing with the required close timestamp. */
export const sampleSoldListing: InvestorListing = {
  id: 'listing-004',
  title: 'Summit Commercial Unit Sold',
  summary: 'A commercial unit with a completed transfer.',
  status: 'sold',
  closedAt: '2026-08-20T12:00:00Z',
  propertyType: 'industrial',
  address: {
    line1: '1 Summit Plaza',
    city: 'San Antonio',
    region: 'TX',
    postalCode: '78205',
    country: 'US',
  },
  financialSummary: {
    askingPrice: 2750000,
    projectedIrrPercent: 7.2,
    capRatePercent: 7.2,
    currency: 'USD',
  },
  contacts: [
    {
      id: 'contact-003',
      fullName: 'Alex Chen',
      email: 'alex.chen@example.com',
      role: 'owner',
    },
  ],
  primaryContactId: 'contact-003',
  ownership: {
    ownerName: 'PREI Summit LLC',
    ownershipPercent: 100,
  },
  createdAt: '2026-04-01T08:00:00Z',
  updatedAt: '2026-08-20T12:00:00Z',
};

/** Archived listing retained for records. */
export const sampleArchivedListing: InvestorListing = {
  id: 'listing-005',
  title: 'Old Commercial Yard',
  summary: 'An archived commercial listing retained for records.',
  status: 'archived',
  propertyType: 'office',
  address: {
    line1: '1200 Foundry Lane',
    city: 'Cleveland',
    region: 'OH',
    postalCode: '44114',
    country: 'US',
  },
  contacts: [],
  primaryContactId: '',
  ownership: {
    ownerName: 'Foundry Yard LLC',
    notes: 'Archived after withdrawal.',
  },
  createdAt: '2026-03-12T10:00:00Z',
  updatedAt: '2026-06-18T15:30:00Z',
};

/** All valid samples for UI mocks and typecheck scripts. */
export const sampleInvestorListings: InvestorListing[] = [
  samplePublishedListing,
  sampleDraftListing,
  sampleUnderOfferListing,
  sampleSoldListing,
  sampleArchivedListing,
];
