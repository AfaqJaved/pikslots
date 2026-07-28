import { Business } from '@pikslots/domain';

const now = new Date();

function futureDate(daysFromNow: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

function pastDate(daysAgo: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

// Reused across reconstitute()d fixtures below -- shapes copied directly
// from Business.create()'s literal defaults, since BusinessProps' nested
// value-object types weren't pasted separately.
const DEFAULT_BOOKING_POLICIES = {
  leadTime: { unit: 'days' as const, value: 0 },
  scheduleWindow: { unit: 'days' as const, value: 10 },
  cancellationPolicy: null,
  bookingPolicyText: '',
  showPolicyOnBookingPage: false,
};

const DEFAULT_BOOKING_SETUP = {
  bookAppointmentSectionVisible: true,
  bookClassSectionVisible: true,
  aboutUsSectionVisible: true,
  ourTeamSectionVisible: true,
  servicesSectionVisible: true,
  classesSectionVisible: true,
  showFirstAvailable: false,
  skipTeamSelection: false,
  allowToBookMultipleServices: false,
  bypassTeamMemberSelection: false,
  customerLoginEnabled: false,
  customerLoginRequired: false,
  hidePikslotsBranding: false,
  accordionView: true,
  allowRescheduling: false,
  allowCancellations: false,
  showBookNewButton: false,
};

const DEFAULT_BOOKING_CONTACT_FIELDS = {
  name: { enabled: true, required: true },
  email: { enabled: true, required: false },
  phone: { enabled: true, required: true },
  address: { enabled: false, required: false },
  customFields: [],
};

const DEFAULT_BOOKING_CUSTOMIZATION = {
  language: 'en',
  timeFormat: '12 hours' as const,
  weekStartsOn: 'monday' as const,
  showBookAnotherAppointmentButton: true,
  showServiceAndClassPrices: true,
  showServiceAndClassDuration: true,
  showBusinessHours: true,
  showLocalTime: true,
};

const DEFAULT_BOOKING_LABEL_OVERRIDES = {
  service: 'Service',
  class: 'Class',
  teamMember: 'Team member',
  city: 'City',
  state: 'State',
  postalCode: 'Postal code',
  termsAndConditions: { label: '', link: '', requireTermsAcceptance: false },
  redirection: { label: '', link: '' },
};

const DEFAULT_BUSINESS_HOURS = {
  monday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  tuesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  wednesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  thursday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  friday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
  saturday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
  sunday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
};

const DEFAULT_BUSINESS_LINKS = {
  Website: '',
  Facebook: '',
  Tiktok: '',
  X: '',
  Youtube: '',
  Instagram: '',
  LinkedIn: '',
};

const DEFAULT_CONTACT_DETAILS = {
  primaryEmail: '',
  primaryPhone: { countryCode: '+1', number: '' },
  additionalEmails: [],
  additionalPhones: [],
};

const DEFAULT_TEAM_NOTIFICATIONS = {
  notifyBookingConfirmation: true,
  notifyBookingChanges: true,
  notifyBookingCancellations: true,
  bookingRemindersTime: {
    active: true,
    type: 'email' as const,
    unit: 'hours' as const,
    value: 24,
  },
  extraCCEmails: [],
};

const DEFAULT_CUSTOMER_NOTIFICATIONS = {
  notifyBookingConfirmation: true,
  notifyBookingChanges: true,
  notifyBookingCancellations: true,
  bookingRemindersTime: {
    active: true,
    type: 'email' as const,
    unit: 'hours' as const,
    value: 24,
  },
};

const DEFAULT_NOTIFICATION_CUSTOMIZATION = {
  emailSenderName: '',
  emailSignature: '',
};

export const BUSINESS_TEST_DATA: Business[] = [
  // ── business-1: fully set up, active, paid, appears in search ──────────
  Business.reconstitute({
    id: 'business-1',
    ownerId: 'user-business-owner-1',
    name: "Alice's Salon & Spa",
    slug: 'alices-salon-and-spa',
    industry: 'salon_and_beauty',
    about: 'A full-service salon offering hair, nails, and spa treatments.',
    appearInSearchResults: true,
    status: 'active',
    suspendedReason: null,
    brandDetail: {
      bannerImageUrl: 'https://cdn.example.com/business-1/banner.jpg',
      brandLogoUrl: 'https://cdn.example.com/business-1/logo.jpg',
    },
    brandApperanceDetails: {
      brandColor: '#D64550',
      brandButtonShape: 'rounded',
      theme: 'light',
      gallaryPhotosUrls: [
        'https://cdn.example.com/business-1/gallery-1.jpg',
        'https://cdn.example.com/business-1/gallery-2.jpg',
      ],
    },
    locationDetails: {
      address: '12 Birch Street',
      city: 'Austin',
      state: 'TX',
      zip: '73301',
      country: 'USA',
      currency: 'USD',
      timeZone: 'America/Chicago',
      language: 'en',
    },
    bookingPolicies: {
      ...DEFAULT_BOOKING_POLICIES,
      cancellationPolicy: { unit: 'hours', value: 24 },
      bookingPolicyText: 'Cancellations within 24 hours may incur a fee.',
      showPolicyOnBookingPage: true,
    },
    bookingSetup: DEFAULT_BOOKING_SETUP,
    bookingContactFields: DEFAULT_BOOKING_CONTACT_FIELDS,
    bookingCustomization: DEFAULT_BOOKING_CUSTOMIZATION,
    bookingLabelOverrides: DEFAULT_BOOKING_LABEL_OVERRIDES,
    businessHours: DEFAULT_BUSINESS_HOURS,
    businessLinks: {
      ...DEFAULT_BUSINESS_LINKS,
      Website: 'https://alicessalon.example.com',
      Instagram: 'https://instagram.com/alicessalon',
    },
    contactDetails: {
      ...DEFAULT_CONTACT_DETAILS,
      primaryEmail: 'contact@alicessalon.example.com',
      primaryPhone: { countryCode: '+1', number: '5550101' },
    },
    teamNotifications: DEFAULT_TEAM_NOTIFICATIONS,
    customerNotifications: DEFAULT_CUSTOMER_NOTIFICATIONS,
    notificationCustomization: {
      emailSenderName: "Alice's Salon & Spa",
      emailSignature: 'See you soon!',
    },
    subscriptionPlan: 'pro',
    subscriptionStatus: 'active',
    trialEndsAt: null,
    createdAt: pastDate(200),
    createdBy: 'user-business-owner-1',
    updatedAt: pastDate(5),
    updatedBy: 'user-business-owner-1',
    deletedAt: null,
    deletedBy: null,
    isDeleted: false,
  }),

  // ── business-2: still on an active trial, mid-setup, different owner ───
  Business.reconstitute({
    id: 'business-2',
    ownerId: 'user-business-owner-2',
    name: 'Momentum Fitness',
    slug: 'momentum-fitness',
    industry: 'fitness',
    about: 'Group fitness classes and personal training.',
    appearInSearchResults: false,
    status: 'pending_setup',
    suspendedReason: null,
    brandDetail: { bannerImageUrl: '', brandLogoUrl: '' },
    brandApperanceDetails: {
      brandColor: '#111111',
      brandButtonShape: 'rounded',
      theme: 'system',
      gallaryPhotosUrls: [],
    },
    locationDetails: {
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      currency: 'USD',
      timeZone: 'America/Denver',
      language: 'en',
    },
    bookingPolicies: DEFAULT_BOOKING_POLICIES,
    bookingSetup: DEFAULT_BOOKING_SETUP,
    bookingContactFields: DEFAULT_BOOKING_CONTACT_FIELDS,
    bookingCustomization: DEFAULT_BOOKING_CUSTOMIZATION,
    bookingLabelOverrides: DEFAULT_BOOKING_LABEL_OVERRIDES,
    businessHours: DEFAULT_BUSINESS_HOURS,
    businessLinks: DEFAULT_BUSINESS_LINKS,
    contactDetails: DEFAULT_CONTACT_DETAILS,
    teamNotifications: DEFAULT_TEAM_NOTIFICATIONS,
    customerNotifications: DEFAULT_CUSTOMER_NOTIFICATIONS,
    notificationCustomization: DEFAULT_NOTIFICATION_CUSTOMIZATION,
    subscriptionPlan: 'free',
    subscriptionStatus: 'trialing',
    // 7 days still remaining -- isTrialing should be true
    trialEndsAt: futureDate(7),
    createdAt: pastDate(7),
    createdBy: 'user-business-owner-2',
    updatedAt: pastDate(7),
    updatedBy: 'user-business-owner-2',
    deletedAt: null,
    deletedBy: null,
    isDeleted: false,
  }),

  // ── business-3: suspended, past_due subscription ────────────────────────
  Business.reconstitute({
    id: 'business-3',
    ownerId: 'user-business-owner-3',
    name: 'Downtown Medical Clinic',
    slug: 'downtown-medical-clinic',
    industry: 'medical',
    about: 'General practice and walk-in consultations.',
    appearInSearchResults: false,
    status: 'suspended',
    suspendedReason: 'Payment failed for 3 consecutive billing cycles.',
    brandDetail: { bannerImageUrl: '', brandLogoUrl: '' },
    brandApperanceDetails: {
      brandColor: '#264653',
      brandButtonShape: 'rectangle',
      theme: 'light',
      gallaryPhotosUrls: [],
    },
    locationDetails: {
      address: '500 Main St',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
      country: 'USA',
      currency: 'USD',
      timeZone: 'America/Denver',
      language: 'en',
    },
    bookingPolicies: DEFAULT_BOOKING_POLICIES,
    bookingSetup: DEFAULT_BOOKING_SETUP,
    bookingContactFields: DEFAULT_BOOKING_CONTACT_FIELDS,
    bookingCustomization: DEFAULT_BOOKING_CUSTOMIZATION,
    bookingLabelOverrides: DEFAULT_BOOKING_LABEL_OVERRIDES,
    businessHours: DEFAULT_BUSINESS_HOURS,
    businessLinks: DEFAULT_BUSINESS_LINKS,
    contactDetails: {
      ...DEFAULT_CONTACT_DETAILS,
      primaryEmail: 'admin@downtownmedical.example.com',
    },
    teamNotifications: DEFAULT_TEAM_NOTIFICATIONS,
    customerNotifications: DEFAULT_CUSTOMER_NOTIFICATIONS,
    notificationCustomization: DEFAULT_NOTIFICATION_CUSTOMIZATION,
    subscriptionPlan: 'starter',
    subscriptionStatus: 'past_due',
    trialEndsAt: null,
    createdAt: pastDate(400),
    createdBy: 'user-business-owner-3',
    updatedAt: pastDate(1),
    updatedBy: 'user-platform-owner-1',
    deletedAt: null,
    deletedBy: null,
    isDeleted: false,
  }),

  // ── business-trial-expired-1: trialing status, but trialEndsAt is in the
  //    past -- exercises the isTrialing getter's date check specifically ──
  Business.reconstitute({
    id: 'business-trial-expired-1',
    ownerId: 'user-business-owner-4',
    name: 'Riverside Legal Advisors',
    slug: 'riverside-legal-advisors',
    industry: 'legal',
    about: '',
    appearInSearchResults: false,
    status: 'inactive',
    suspendedReason: null,
    brandDetail: { bannerImageUrl: '', brandLogoUrl: '' },
    brandApperanceDetails: {
      brandColor: '#111111',
      brandButtonShape: 'rounded',
      theme: 'system',
      gallaryPhotosUrls: [],
    },
    locationDetails: {
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      currency: 'USD',
      timeZone: 'UTC',
      language: 'en',
    },
    bookingPolicies: DEFAULT_BOOKING_POLICIES,
    bookingSetup: DEFAULT_BOOKING_SETUP,
    bookingContactFields: DEFAULT_BOOKING_CONTACT_FIELDS,
    bookingCustomization: DEFAULT_BOOKING_CUSTOMIZATION,
    bookingLabelOverrides: DEFAULT_BOOKING_LABEL_OVERRIDES,
    businessHours: DEFAULT_BUSINESS_HOURS,
    businessLinks: DEFAULT_BUSINESS_LINKS,
    contactDetails: DEFAULT_CONTACT_DETAILS,
    teamNotifications: DEFAULT_TEAM_NOTIFICATIONS,
    customerNotifications: DEFAULT_CUSTOMER_NOTIFICATIONS,
    notificationCustomization: DEFAULT_NOTIFICATION_CUSTOMIZATION,
    subscriptionPlan: 'free',
    subscriptionStatus: 'trialing',
    // 14 days already elapsed -- isTrialing should be false despite the
    // status still saying "trialing", since trialEndsAt has passed.
    trialEndsAt: pastDate(1),
    createdAt: pastDate(15),
    createdBy: 'user-business-owner-4',
    updatedAt: pastDate(15),
    updatedBy: 'user-business-owner-4',
    deletedAt: null,
    deletedBy: null,
    isDeleted: false,
  }),

  // ── business-deleted-1: soft-deleted ────────────────────────────────────
  Business.reconstitute({
    id: 'business-deleted-1',
    ownerId: 'user-business-owner-5',
    name: 'Closed Retail Shop',
    slug: 'closed-retail-shop',
    industry: 'retail',
    about: '',
    appearInSearchResults: false,
    status: 'inactive',
    suspendedReason: null,
    brandDetail: { bannerImageUrl: '', brandLogoUrl: '' },
    brandApperanceDetails: {
      brandColor: '#111111',
      brandButtonShape: 'rounded',
      theme: 'system',
      gallaryPhotosUrls: [],
    },
    locationDetails: {
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      currency: 'USD',
      timeZone: 'UTC',
      language: 'en',
    },
    bookingPolicies: DEFAULT_BOOKING_POLICIES,
    bookingSetup: DEFAULT_BOOKING_SETUP,
    bookingContactFields: DEFAULT_BOOKING_CONTACT_FIELDS,
    bookingCustomization: DEFAULT_BOOKING_CUSTOMIZATION,
    bookingLabelOverrides: DEFAULT_BOOKING_LABEL_OVERRIDES,
    businessHours: DEFAULT_BUSINESS_HOURS,
    businessLinks: DEFAULT_BUSINESS_LINKS,
    contactDetails: DEFAULT_CONTACT_DETAILS,
    teamNotifications: DEFAULT_TEAM_NOTIFICATIONS,
    customerNotifications: DEFAULT_CUSTOMER_NOTIFICATIONS,
    notificationCustomization: DEFAULT_NOTIFICATION_CUSTOMIZATION,
    subscriptionPlan: 'free',
    subscriptionStatus: 'cancelled',
    trialEndsAt: null,
    createdAt: pastDate(100),
    createdBy: 'user-business-owner-5',
    updatedAt: pastDate(2),
    updatedBy: 'user-business-owner-5',
    deletedAt: pastDate(2),
    deletedBy: 'user-platform-owner-1',
    isDeleted: true,
  }),

  // ── business-new-1: exactly what Business.create() produces, for
  //    "freshly registered" scenarios -- built via create() itself rather
  //    than duplicating its defaults here. ─────────────────────────────────
  Business.create({
    id: 'business-new-1',
    ownerId: 'user-business-owner-6',
    slug: 'new-yoga-studio',
    name: 'New Yoga Studio',
    industry: 'health_and_wellness',
    defaultTimeZone: 'America/Los_Angeles',
    createdBy: 'user-business-owner-6',
  }),
];
