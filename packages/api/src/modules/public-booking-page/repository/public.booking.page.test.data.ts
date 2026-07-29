// public-booking-page.test.data.ts
import {
  BusinessDetails,
  Services,
  TeamMemberDetails,
} from '@pikslots/domain';

// ── Business details (business-1) ─────────────────────────────────────────
// NOTE: nested type shapes (BrandDetails, BookingPolicies, LocationDetails,
// etc.) were not provided in this session — verify field names against the
// real `../business` type definitions before relying on this fixture.
export const BUSINESS_DETAILS_TEST_DATA: BusinessDetails = {
  id: 'business-1',
  name: 'Glow Salon & Spa',
  slug: 'glow-salon-spa',
  about: 'A modern salon offering hair, skin, and nail services.',
  brandDetail: {
    logoUrl: 'https://cdn.pikslots.com/business-1/logo.png',
    tagline: 'Look good, feel great',
  } as BusinessDetails['brandDetail'],
  brandApperanceDetails: {
    primaryColor: '#1F2937',
    accentColor: '#F59E0B',
    fontFamily: 'Inter',
  } as BusinessDetails['brandApperanceDetails'],
  bookingPolicies: {
    cancellationWindowHours: 24,
    requireDeposit: false,
  } as BusinessDetails['bookingPolicies'],
  locationDetails: {
    addressLine1: '123 Main Street',
    city: 'Karachi',
    country: 'Pakistan',
    latitude: 24.8607,
    longitude: 67.0011,
  } as BusinessDetails['locationDetails'],
  bookingSetup: {
    slotIntervalMins: 15,
    advanceBookingDays: 30,
  } as BusinessDetails['bookingSetup'],
  bookingContactFields: {
    requirePhone: true,
    requireEmail: true,
  } as BusinessDetails['bookingContactFields'],
  bookingCustomization: {
    showPricing: true,
    showDuration: true,
  } as BusinessDetails['bookingCustomization'],
  bookingLabelOverrides: {
    bookNowLabel: 'Book Your Appointment',
  } as BusinessDetails['bookingLabelOverrides'],
  businessHours: {
    monday: { open: '09:00', close: '18:00', isClosed: false },
    tuesday: { open: '09:00', close: '18:00', isClosed: false },
    sunday: { open: '00:00', close: '00:00', isClosed: true },
  } as BusinessDetails['businessHours'],
  businessLinks: {
    website: 'https://glowsalon.com',
    instagram: 'https://instagram.com/glowsalon',
  } as BusinessDetails['businessLinks'],
};

// A second business, for slug-lookup isolation tests
export const BUSINESS_DETAILS_TEST_DATA_2: BusinessDetails = {
  ...BUSINESS_DETAILS_TEST_DATA,
  id: 'business-2',
  name: 'Urban Cuts Barbershop',
  slug: 'urban-cuts-barbershop',
  about: 'A no-frills barbershop for modern cuts.',
};

// ── Services (business-1) ──────────────────────────────────────────────────
export const SERVICES_TEST_DATA: Services[] = [
  {
    id: 'service-haircut-1',
    title: 'Haircut',
    description: 'A classic haircut and style.',
    serviceAvatar: 'https://cdn.pikslots.com/services/haircut.png',
    durationInMins: 30,
    bufferTimeInMins: 5,
    cost: 25,
    isHiddenFromBookingPage: false,
    colorCode: '#3B82F6',
  },
  {
    id: 'service-color-1',
    title: 'Hair Coloring',
    description: 'Full hair color treatment.',
    serviceAvatar: 'https://cdn.pikslots.com/services/color.png',
    durationInMins: 60,
    bufferTimeInMins: 10,
    cost: 80,
    isHiddenFromBookingPage: false,
    colorCode: '#EC4899',
  },
  {
    id: 'service-massage-1',
    title: 'Massage',
    description: 'Relaxing full-body massage.',
    serviceAvatar: 'https://cdn.pikslots.com/services/massage.png',
    durationInMins: 45,
    bufferTimeInMins: 15,
    cost: 60,
    isHiddenFromBookingPage: false,
    colorCode: '#10B981',
  },
  // Hidden from the public booking page — used to test filtering behavior
  // if any use case is expected to exclude these.
  {
    id: 'service-internal-consult-1',
    title: 'Internal Consultation',
    description: 'Staff-only consultation slot.',
    serviceAvatar: '',
    durationInMins: 15,
    bufferTimeInMins: 0,
    cost: 0,
    isHiddenFromBookingPage: true,
    colorCode: '#6B7280',
  },
];

// A service belonging to a different business (isolation checks)
export const SERVICES_TEST_DATA_BUSINESS_2: Services[] = [
  {
    id: 'service-shave-1',
    title: 'Beard Shave',
    description: 'Traditional hot towel shave.',
    serviceAvatar: 'https://cdn.pikslots.com/services/shave.png',
    durationInMins: 20,
    bufferTimeInMins: 5,
    cost: 20,
    isHiddenFromBookingPage: false,
    colorCode: '#F59E0B',
  },
];

// ── Service groups (business-1) ────────────────────────────────────────────
export const SERVICE_GROUPS_TEST_DATA: { id: string; name: string; businessId: string }[] = [
  { id: 'group-styling-1', name: 'Styling', businessId: 'business-1' },
  { id: 'group-grooming-1', name: 'Grooming', businessId: 'business-1' },
];

// ── Service <-> group assignments (business-1) ─────────────────────────────
export const SERVICE_GROUP_ASSIGNMENTS_TEST_DATA: {
  id: string;
  serviceId: string;
  serviceGroupId: string;
  businessId: string;
}[] = [
  {
    id: 'sga-1',
    serviceId: 'service-haircut-1',
    serviceGroupId: 'group-styling-1',
    businessId: 'business-1',
  },
  {
    id: 'sga-2',
    serviceId: 'service-color-1',
    serviceGroupId: 'group-styling-1',
    businessId: 'business-1',
  },
  {
    id: 'sga-3',
    serviceId: 'service-massage-1',
    serviceGroupId: 'group-grooming-1',
    businessId: 'business-1',
  },
];

// ── Team members (business-1) ──────────────────────────────────────────────
export const TEAM_MEMBERS_TEST_DATA: TeamMemberDetails[] = [
  {
    id: 'user-standard-1',
    name: { firstName: 'Alice', lastName: 'Khan' },
    avatarUrl: 'https://cdn.pikslots.com/users/alice.png',
    role: 'Standard',
    serviceIds: ['service-haircut-1', 'service-color-1'],
  },
  {
    id: 'user-enhanced-1',
    name: { firstName: 'Bilal', lastName: 'Ahmed' },
    avatarUrl: null,
    role: 'Enhanced',
    serviceIds: ['service-massage-1'],
  },
  {
    id: 'user-business-owner-1',
    name: { firstName: 'Sara', lastName: 'Malik' },
    avatarUrl: 'https://cdn.pikslots.com/users/sara.png',
    role: 'Business Owner',
    serviceIds: null, // owner not directly bookable
  },
];

// Team member belonging to a different business (isolation checks)
export const TEAM_MEMBERS_TEST_DATA_BUSINESS_2: TeamMemberDetails[] = [
  {
    id: 'user-standard-2',
    name: { firstName: 'Zara', lastName: 'Iqbal' },
    avatarUrl: null,
    role: 'Standard',
    serviceIds: ['service-shave-1'],
  },
];

// ── Service <-> user assignments (business-1) ──────────────────────────────
export const SERVICE_USER_ASSIGNMENTS_TEST_DATA: {
  id: string;
  serviceId: string;
  userId: string;
  businessId: string;
}[] = [
  {
    id: 'sua-1',
    serviceId: 'service-haircut-1',
    userId: 'user-standard-1',
    businessId: 'business-1',
  },
  {
    id: 'sua-2',
    serviceId: 'service-color-1',
    userId: 'user-standard-1',
    businessId: 'business-1',
  },
  {
    id: 'sua-3',
    serviceId: 'service-massage-1',
    userId: 'user-enhanced-1',
    businessId: 'business-1',
  },
];