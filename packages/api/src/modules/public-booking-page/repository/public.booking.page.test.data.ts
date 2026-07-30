import type {
  BusinessDetails,
  Services,
  TeamMemberDetails,
} from '@pikslots/domain';

// ── Fixture data ─────────────────────────────────────────────────────────────
// NOTE: nested business sub-types (BrandDetails, BookingPolicies, BookingSetup,
// etc.) are stubbed with minimal fields and cast via `unknown` since their full
// shapes weren't available when these fixtures were written. If any use case
// under test actually reads fields beyond what's stubbed here, add them to the
// relevant object below rather than casting around it again.

export const PUBLIC_BOOKING_PAGE_BUSINESS_TEST_DATA: (BusinessDetails & {
  isDeleted: boolean; // internal-only flag used by the fake repo, not part of BusinessDetails itself
})[] = [
  {
    id: 'business-1',
    name: 'Glow Hair Studio',
    slug: 'glow-hair-studio',
    about: 'A full-service hair and beauty studio.',
    brandDetail: {
      logoUrl: 'https://example.com/logo-1.png',
      primaryColor: '#FF6F61',
    } as unknown as BusinessDetails['brandDetail'],
    brandApperanceDetails: {
      fontFamily: 'Inter',
      theme: 'light',
    } as unknown as BusinessDetails['brandApperanceDetails'],
    bookingPolicies: {
      cancellationWindowHours: 24,
      requiresDeposit: false,
    } as unknown as BusinessDetails['bookingPolicies'],
    locationDetails: {
      address: '123 Main St',
      city: 'Karachi',
      country: 'PK',
    } as unknown as BusinessDetails['locationDetails'],
    bookingSetup: {
      allowOnlineBooking: true,
      bufferBetweenBookingsMins: 10,
    } as unknown as BusinessDetails['bookingSetup'],
    bookingContactFields: {
      requireEmail: true,
      requirePhone: true,
    } as unknown as BusinessDetails['bookingContactFields'],
    bookingCustomization: {
      confirmationMessage: 'See you soon!',
    } as unknown as BusinessDetails['bookingCustomization'],
    bookingLabelOverrides: {
      serviceLabel: 'Treatment',
    } as unknown as BusinessDetails['bookingLabelOverrides'],
    businessHours: {
      monday: { open: '09:00', close: '18:00' },
    } as unknown as BusinessDetails['businessHours'],
    businessLinks: {
      website: 'https://glowhairstudio.example.com',
    } as unknown as BusinessDetails['businessLinks'],
    contactDetails: {
      primaryEmail: 'contact@glowhairstudio.example.com',
      primaryPhone: { countryCode: '+92', number: '3001234567' },
      additionalEmails: [],
      additionalPhones: [],
    } as unknown as BusinessDetails['contactDetails'],
    isDeleted: false,
  },
  {
    id: 'business-2',
    name: 'Zen Spa & Wellness',
    slug: 'zen-spa-wellness',
    about: 'Relaxation and wellness treatments.',
    brandDetail: {
      logoUrl: 'https://example.com/logo-2.png',
      primaryColor: '#4CAF93',
    } as unknown as BusinessDetails['brandDetail'],
    brandApperanceDetails: {
      fontFamily: 'Lora',
      theme: 'dark',
    } as unknown as BusinessDetails['brandApperanceDetails'],
    bookingPolicies: {
      cancellationWindowHours: 48,
      requiresDeposit: true,
    } as unknown as BusinessDetails['bookingPolicies'],
    locationDetails: {
      address: '456 Ocean Rd',
      city: 'Karachi',
      country: 'PK',
    } as unknown as BusinessDetails['locationDetails'],
    bookingSetup: {
      allowOnlineBooking: true,
      bufferBetweenBookingsMins: 15,
    } as unknown as BusinessDetails['bookingSetup'],
    bookingContactFields: {
      requireEmail: true,
      requirePhone: false,
    } as unknown as BusinessDetails['bookingContactFields'],
    bookingCustomization: {
      confirmationMessage: 'Thank you for booking with us.',
    } as unknown as BusinessDetails['bookingCustomization'],
    bookingLabelOverrides: {
      serviceLabel: 'Session',
    } as unknown as BusinessDetails['bookingLabelOverrides'],
    businessHours: {
      monday: { open: '10:00', close: '20:00' },
    } as unknown as BusinessDetails['businessHours'],
    businessLinks: {
      website: 'https://zenspa.example.com',
    } as unknown as BusinessDetails['businessLinks'],
    contactDetails: {
      primaryEmail: 'contact@zenspa.example.com',
      primaryPhone: { countryCode: '+92', number: '3007654321' },
      additionalEmails: [],
      additionalPhones: [],
    } as unknown as BusinessDetails['contactDetails'],
    isDeleted: false,
  },
  {
    id: 'business-3',
    name: 'Retired Salon',
    slug: 'retired-salon',
    about: 'No longer operating.',
    brandDetail: {} as unknown as BusinessDetails['brandDetail'],
    brandApperanceDetails:
      {} as unknown as BusinessDetails['brandApperanceDetails'],
    bookingPolicies: {} as unknown as BusinessDetails['bookingPolicies'],
    locationDetails: {} as unknown as BusinessDetails['locationDetails'],
    bookingSetup: {} as unknown as BusinessDetails['bookingSetup'],
    bookingContactFields:
      {} as unknown as BusinessDetails['bookingContactFields'],
    bookingCustomization:
      {} as unknown as BusinessDetails['bookingCustomization'],
    bookingLabelOverrides:
      {} as unknown as BusinessDetails['bookingLabelOverrides'],
    businessHours: {} as unknown as BusinessDetails['businessHours'],
    businessLinks: {} as unknown as BusinessDetails['businessLinks'],
    contactDetails: {} as unknown as BusinessDetails['contactDetails'],
    // soft-deleted — proves findBusinessDetailsByBusinessSlug excludes it
    isDeleted: true,
  },
];

export const PUBLIC_BOOKING_PAGE_SERVICES_TEST_DATA: (Services & {
  businessId: string;
  isDeleted: boolean;
})[] = [
  {
    id: 'service-haircut-1',
    businessId: 'business-1',
    title: 'Haircut',
    description: 'Classic haircut and style.',
    serviceAvatar: 'https://example.com/haircut.png',
    durationInMins: 30,
    bufferTimeInMins: 5,
    cost: 2500,
    isHiddenFromBookingPage: false,
    colorCode: '#FFAA00',
    isDeleted: false,
  },
  {
    id: 'service-color-1',
    businessId: 'business-1',
    title: 'Hair Coloring',
    description: 'Full hair color service.',
    serviceAvatar: 'https://example.com/color.png',
    durationInMins: 90,
    bufferTimeInMins: 15,
    cost: 6000,
    isHiddenFromBookingPage: false,
    colorCode: '#AA00FF',
    isDeleted: false,
  },
  {
    id: 'service-hidden-1',
    businessId: 'business-1',
    title: 'VIP Consultation',
    description: 'Hidden from the public booking page.',
    serviceAvatar: 'https://example.com/vip.png',
    durationInMins: 15,
    bufferTimeInMins: 0,
    cost: 0,
    isHiddenFromBookingPage: true,
    colorCode: '#000000',
    isDeleted: false,
  },
  {
    id: 'service-massage-1',
    businessId: 'business-2',
    title: 'Swedish Massage',
    description: '60-minute relaxation massage.',
    serviceAvatar: 'https://example.com/massage.png',
    durationInMins: 60,
    bufferTimeInMins: 10,
    cost: 5000,
    isHiddenFromBookingPage: false,
    colorCode: '#00AAAA',
    isDeleted: false,
  },
  {
    id: 'service-retired-1',
    businessId: 'business-1',
    title: 'Discontinued Perm',
    description: 'No longer offered.',
    serviceAvatar: 'https://example.com/perm.png',
    durationInMins: 45,
    bufferTimeInMins: 5,
    cost: 3000,
    isHiddenFromBookingPage: false,
    colorCode: '#888888',
    // soft-deleted — proves findAllServiceDetailsByBusinessId excludes it
    isDeleted: true,
  },
];

export const PUBLIC_BOOKING_PAGE_SERVICE_GROUPS_TEST_DATA: {
  id: string;
  name: string;
  businessId: string;
  isDeleted: boolean;
}[] = [
  {
    id: 'sg-hair',
    name: 'Hair Services',
    businessId: 'business-1',
    isDeleted: false,
  },
  {
    id: 'sg-color',
    name: 'Color Services',
    businessId: 'business-1',
    isDeleted: false,
  },
  {
    id: 'sg-massage',
    name: 'Massage Services',
    businessId: 'business-2',
    isDeleted: false,
  },
  {
    id: 'sg-retired',
    name: 'Retired Group',
    businessId: 'business-1',
    // soft-deleted — proves findAllServiceGroupDetailsByBusinessId excludes it
    isDeleted: true,
  },
];

export const PUBLIC_BOOKING_PAGE_SERVICE_GROUP_ASSIGNMENTS_TEST_DATA: {
  id: string;
  serviceId: string;
  serviceGroupId: string;
  businessId: string;
}[] = [
  {
    id: 'sga-1',
    serviceId: 'service-haircut-1',
    serviceGroupId: 'sg-hair',
    businessId: 'business-1',
  },
  {
    id: 'sga-2',
    serviceId: 'service-color-1',
    serviceGroupId: 'sg-color',
    businessId: 'business-1',
  },
  {
    id: 'sga-3',
    serviceId: 'service-massage-1',
    serviceGroupId: 'sg-massage',
    businessId: 'business-2',
  },
  // NOTE: no is_deleted filter on this table in the real repo — this
  // assignment references a soft-deleted service on purpose, to prove the
  // fake mirrors that (does NOT filter it out).
  {
    id: 'sga-4',
    serviceId: 'service-retired-1',
    serviceGroupId: 'sg-retired',
    businessId: 'business-1',
  },
];

export const PUBLIC_BOOKING_PAGE_TEAM_MEMBERS_TEST_DATA: (TeamMemberDetails & {
  businessId: string;
  isDeleted: boolean;
})[] = [
  {
    id: 'user-stylist-1',
    businessId: 'business-1',
    name: { firstName: 'Amina', lastName: 'Khan' },
    avatarUrl: 'https://example.com/avatar-1.png',
    role: 'Standard',
    serviceIds: ['service-haircut-1', 'service-color-1'],
    isDeleted: false,
  },
  {
    id: 'user-owner-1',
    businessId: 'business-1',
    name: { firstName: 'Bilal', lastName: 'Ahmed' },
    avatarUrl: null,
    role: 'Business Owner',
    serviceIds: null,
    isDeleted: false,
  },
  {
    id: 'user-masseuse-1',
    businessId: 'business-2',
    name: { firstName: 'Sara', lastName: 'Yousuf' },
    avatarUrl: 'https://example.com/avatar-3.png',
    role: 'Standard',
    serviceIds: ['service-massage-1'],
    isDeleted: false,
  },
  {
    id: 'user-former-1',
    businessId: 'business-1',
    name: { firstName: 'Former', lastName: 'Employee' },
    avatarUrl: null,
    role: 'Standard',
    serviceIds: [],
    // soft-deleted — proves findAllTeamMembersByBusinessId excludes it
    isDeleted: true,
  },
];

export const PUBLIC_BOOKING_PAGE_SERVICE_USER_ASSIGNMENTS_TEST_DATA: {
  id: string;
  serviceId: string;
  userId: string;
  businessId: string;
}[] = [
  {
    id: 'sua-1',
    serviceId: 'service-haircut-1',
    userId: 'user-stylist-1',
    businessId: 'business-1',
  },
  {
    id: 'sua-2',
    serviceId: 'service-color-1',
    userId: 'user-stylist-1',
    businessId: 'business-1',
  },
  {
    id: 'sua-3',
    serviceId: 'service-massage-1',
    userId: 'user-masseuse-1',
    businessId: 'business-2',
  },
  // NOTE: no is_deleted filter on this table either — references a
  // soft-deleted team member on purpose, to prove the fake mirrors that.
  {
    id: 'sua-4',
    serviceId: 'service-haircut-1',
    userId: 'user-former-1',
    businessId: 'business-1',
  },
];
