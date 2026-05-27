// ── Scalar types ──────────────────────────────────────────────────────────────

export type BusinessIndustry =
  | 'salon_and_beauty'
  | 'health_and_wellness'
  | 'fitness'
  | 'medical'
  | 'education'
  | 'legal'
  | 'financial'
  | 'hospitality'
  | 'retail'
  | 'other';

export type BusinessStatus = 'pending_setup' | 'active' | 'inactive' | 'suspended';
export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled';
export type BrandButtonShape = 'pill' | 'rounded' | 'rectangle';
export type BrandTheme = 'system' | 'light' | 'dark';
export type SupportedCurrencies = 'USD' | 'PKR' | 'RUB';
export type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

// ── Value object types ────────────────────────────────────────────────────────

export interface BrandDetails {
  bannerImageUrl: string;
  brandLogoUrl: string;
}

export interface BrandAppearanceDetails {
  brandColor: string;
  brandButtonShape: BrandButtonShape;
  theme: BrandTheme;
  gallaryPhotosUrls: string[];
}

export interface LocationDetails {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  currency: SupportedCurrencies;
  timeZone: string;
  language: string;
}

export interface BookingPolicies {
  leadTime: { unit: TimeUnit; value: number };
  scheduleWindow: { unit: TimeUnit; value: number };
  cancellationPolicy: { unit: TimeUnit; value: number } | null;
  bookingPolicyText: string;
  showPolicyOnBookingPage: boolean;
}

export interface StandardContactField {
  enabled: boolean;
  required: boolean;
}

export interface CustomContactField {
  label: string;
  enabled: boolean;
  required: boolean;
}

export interface BookingSetup {
  bookAppointmentSectionVisible: boolean;
  bookClassSectionVisible: boolean;
  aboutUsSectionVisible: boolean;
  ourTeamSectionVisible: boolean;
  servicesSectionVisible: boolean;
  classesSectionVisible: boolean;
  showFirstAvailable: boolean;
  skipTeamSelection: boolean;
  allowToBookMultipleServices: boolean;
  bypassTeamMemberSelection: boolean;
  customerLoginEnabled: boolean;
  customerLoginRequired: boolean;
  hidePikslotsBranding: boolean;
  accordionView: boolean;
  allowRescheduling: boolean;
  allowCancellations: boolean;
  showBookNewButton: boolean;
}

export interface BookingContactFields {
  name: StandardContactField;
  email: StandardContactField;
  phone: StandardContactField;
  address: StandardContactField;
  customFields: CustomContactField[];
}

export interface BookingCustomization {
  language: string;
  timeFormat: '12 hours' | '24 hours';
  weekStartsOn: WeekDay;
  showBookAnotherAppointmentButton: boolean;
  showServiceAndClassPrices: boolean;
  showServiceAndClassDuration: boolean;
  showBusinessHours: boolean;
  showLocalTime: boolean;
}

export interface BookingLabelOverrides {
  service: string;
  class: string;
  teamMember: string;
  city: string;
  state: string;
  postalCode: string;
  termsAndConditions: { label: string; link: string; requireTermsAcceptance: boolean };
  redirection: { label: string; link: string };
}

// ── Requests ──────────────────────────────────────────────────────────────────

export interface RegisterBusinessInput {
  ownerId: string;
  slug: string;
  name: string;
  industry: BusinessIndustry;
  defaultTimeZone?: string;
}

// ── Responses ─────────────────────────────────────────────────────────────────

export interface RegisterBusinessResponse {
  message: 'success';
}

export interface BusinessResponse {
  // core
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  industry: BusinessIndustry;
  about: string;
  appearInSearchResults: boolean;
  status: BusinessStatus;
  suspendedReason: string | null;
  // settings
  brandDetail: BrandDetails;
  brandAppearanceDetails: BrandAppearanceDetails;
  locationDetails: LocationDetails;
  bookingPolicies: BookingPolicies;
  bookingSetup: BookingSetup;
  bookingContactFields: BookingContactFields;
  bookingCustomization: BookingCustomization;
  bookingLabelOverrides: BookingLabelOverrides;
  // subscription
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date | null;
  // audit
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export type GetAllBusinessesResponse = BusinessResponse[];
