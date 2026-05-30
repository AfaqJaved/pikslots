// ── Types ─────────────────────────────────────────────────────────────────────

export type BusinessStatus = 'pending_setup' | 'active' | 'inactive' | 'suspended';
export type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
export type NotificationType = 'email' | 'sms';
export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

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

export interface DayHours {
  enabled: boolean;
  openTime: string; // 'HH:mm' 25-hour, e.g. '09:00'
  closeTime: string; // 'HH:mm' 25-hour, e.g. '17:00'
}

export type BusinessHours = Record<WeekDay, DayHours>;

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise';
export type BrandButtonShape = 'pill' | 'rounded' | 'rectangle';
export type BrandTheme = 'system' | 'light' | 'dark';
export type SupportedCurrencies = 'USD' | 'PKR' | 'RUB';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled';

export interface StandardContactField {
  enabled: boolean;
  required: boolean;
}

export interface CustomContactField {
  label: string;
  enabled: boolean;
  required: boolean;
}

// ── Value objects ─────────────────────────────────────────────────────────────

export interface BrandDetails {
  bannerImageUrl: string;
  brandLogoUrl: string;
}

export interface BrandApperanceDetails {
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
  // Lead Time -> How much notice do you require before an appointment?
  leadTime: {
    unit: TimeUnit;
    value: number;
  };
  // Schedule Window ->  How far in advance can customers schedule an appointment?
  scheduleWindow: {
    unit: TimeUnit;
    value: number;
  };
  cancellationPolicy: {
    unit: TimeUnit;
    value: number;
  } | null; // null is equal to anytime

  bookingPolicyText: string;
  showPolicyOnBookingPage: boolean;
}

export interface BookingSetup {
  bookAppointmentSectionVisible: boolean;
  bookClassSectionVisible: boolean;
  aboutUsSectionVisible: boolean;
  ourTeamSectionVisible: boolean;
  servicesSectionVisible: boolean;
  classesSectionVisible: boolean;

  showFirstAvailable: boolean; // "First available appointment"
  skipTeamSelection: boolean; // "Skip team members"
  allowToBookMultipleServices: boolean; // "Provide multiple services"
  bypassTeamMemberSelection: boolean; // "Any team member"
  customerLoginEnabled: boolean; // "Customer login"
  customerLoginRequired: boolean; // "Required" (sub-option of customer login)
  hidePikslotsBranding: boolean; // "Hide branding"
  accordionView: boolean; // "Accordion view"
  allowRescheduling: boolean; // "Allow online rescheduling"
  allowCancellations: boolean; // "Allow online cancellations"
  showBookNewButton: boolean; // "'Book new appointment' button"
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
  showBookAnotherAppointmentButton: boolean; // "'Book another appointment' button"
  showServiceAndClassPrices: boolean; // "Service and class prices"
  showServiceAndClassDuration: boolean; // "Service and class duration"
  showBusinessHours: boolean; // "Business hours"
  showLocalTime: boolean; // "Local time"
}

export interface BookingLabelOverrides {
  service: string;
  class: string;
  teamMember: string;
  city: string;
  state: string;
  postalCode: string;
  termsAndConditions: {
    label: string;
    link: string;
    requireTermsAcceptance: boolean;
  };
  redirection: {
    label: string;
    link: string;
  };
}

export interface BusinessTeamNotifications {
  notifyBookingConfirmation: boolean;
  notifyBookingChanges: boolean;
  notifyBookingCancellations: boolean;
  bookingRemindersTime: {
    active: boolean;
    type: NotificationType;
    unit: TimeUnit;
    value: number;
  };
  extraCCEmails: string[];
}

export interface BusinessCustomerNotifications {
  notifyBookingConfirmation: boolean;
  notifyBookingChanges: boolean;
  notifyBookingCancellations: boolean;
  bookingRemindersTime: {
    active: boolean;
    type: NotificationType;
    unit: TimeUnit;
    value: number;
  };
}
export interface BusinessNotificationCustomization {
  emailSenderName: string;
  emailSignature: string;
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface BusinessProps {
  readonly id: string;
  readonly ownerId: string; // references User.id (businessOwner role)
  readonly name: string;
  readonly slug: string; // unique, URL-friendly tenant identifier e.g. "joes-barbershop"
  readonly industry: BusinessIndustry;
  readonly about: string;
  readonly appearInSearchResults: boolean;
  readonly status: BusinessStatus;
  readonly suspendedReason: string | null;

  // settings
  readonly brandDetail: BrandDetails;
  readonly brandApperanceDetails: BrandApperanceDetails;
  readonly locationDetails: LocationDetails;
  readonly bookingPolicies: BookingPolicies;
  readonly bookingSetup: BookingSetup;
  readonly bookingContactFields: BookingContactFields;
  readonly bookingCustomization: BookingCustomization;
  readonly bookingLabelOverrides: BookingLabelOverrides;

  //notifications
  readonly teamNotifications: BusinessTeamNotifications;
  readonly customerNotifications: BusinessCustomerNotifications;
  readonly notificationCustomization: BusinessNotificationCustomization;

  readonly businessHours: BusinessHours;

  //Relations
  //TODO contact details
  //TODO business social links

  // subscription
  readonly subscriptionPlan: SubscriptionPlan;
  readonly subscriptionStatus: SubscriptionStatus;
  readonly trialEndsAt: Date | null;
  // audit
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly updatedAt: Date;
  readonly updatedBy: string;
  readonly deletedAt: Date | null;
  readonly deletedBy: string | null;
  readonly isDeleted: boolean;
}

// ── Create input ──────────────────────────────────────────────────────────────

export interface CreateBusinessInput {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  industry: BusinessIndustry;
  defaultTimeZone: string;
  createdBy: string;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class Business {
  private readonly props: BusinessProps;

  private constructor(props: BusinessProps) {
    this.props = props;
  }

  /**
   * Creates a brand-new Business with defaults applied.
   * Use this in application use-cases, never for rehydrating persisted data.
   */
  static create(input: CreateBusinessInput): Business {
    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    return new Business({
      id: input.id,
      ownerId: input.ownerId,
      slug: input.slug,
      name: input.name,
      industry: input.industry,
      about: '',
      appearInSearchResults: false,
      status: 'pending_setup',
      suspendedReason: null,
      brandDetail: {
        bannerImageUrl: '',
        brandLogoUrl: '',
      },
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
        timeZone: input.defaultTimeZone ?? 'UTC',
        language: 'en',
      },
      bookingPolicies: {
        leadTime: { unit: 'days', value: 0 },
        scheduleWindow: { unit: 'days', value: 10 },
        cancellationPolicy: null, // null -> anytime
        bookingPolicyText: '',
        showPolicyOnBookingPage: false,
      },
      bookingSetup: {
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
      },
      bookingContactFields: {
        name: { enabled: true, required: true },
        email: { enabled: true, required: false },
        phone: { enabled: true, required: true },
        address: { enabled: false, required: false },
        customFields: [],
      },
      bookingCustomization: {
        language: 'en',
        timeFormat: '12 hours',
        weekStartsOn: 'monday',
        showBookAnotherAppointmentButton: true,
        showServiceAndClassPrices: true,
        showServiceAndClassDuration: true,
        showBusinessHours: true,
        showLocalTime: true,
      },
      bookingLabelOverrides: {
        service: 'Service',
        class: 'Class',
        teamMember: 'Team member',
        city: 'City',
        state: 'State',
        postalCode: 'Postal code',
        termsAndConditions: {
          label: '',
          link: '',
          requireTermsAcceptance: false,
        },
        redirection: {
          label: '',
          link: '',
        },
      },
      businessHours: {
        monday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
        tuesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
        wednesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
        thursday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
        friday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
        saturday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
        sunday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
      },
      teamNotifications: {
        notifyBookingConfirmation: true,
        notifyBookingChanges: true,
        notifyBookingCancellations: true,
        bookingRemindersTime: { active: true, type: 'email', unit: 'hours', value: 24 },
        extraCCEmails: [],
      },
      customerNotifications: {
        notifyBookingConfirmation: true,
        notifyBookingChanges: true,
        notifyBookingCancellations: true,
        bookingRemindersTime: { active: true, type: 'email', unit: 'hours', value: 24 },
      },
      notificationCustomization: {
        emailSenderName: '',
        emailSignature: '',
      },
      subscriptionPlan: 'free',
      subscriptionStatus: 'trialing',
      trialEndsAt,
      createdAt: now,
      createdBy: input.createdBy,
      updatedAt: now,
      updatedBy: input.createdBy,
      deletedAt: null,
      deletedBy: null,
      isDeleted: false,
    });
  }

  /**
   * Reconstitutes a Business from already-validated data (e.g. a database row).
   * Never call with raw untrusted input.
   */
  static reconstitute(props: BusinessProps): Business {
    return new Business(props);
  }

  // ── Identity ───────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  equals(other: Business): boolean {
    return this.props.id === other.props.id;
  }

  // ── Core fields ────────────────────────────────────────────────────────────

  get ownerId(): string {
    return this.props.ownerId;
  }
  get slug(): string {
    return this.props.slug;
  }
  get name(): string {
    return this.props.name;
  }
  get industry(): BusinessIndustry {
    return this.props.industry;
  }
  get about(): string {
    return this.props.about;
  }
  get appearInSearchResults(): boolean {
    return this.props.appearInSearchResults;
  }
  get status(): BusinessStatus {
    return this.props.status;
  }
  get suspendedReason(): string | null {
    return this.props.suspendedReason;
  }

  // ── Settings ───────────────────────────────────────────────────────────────

  get brandDetail(): BrandDetails {
    return this.props.brandDetail;
  }
  get brandApperanceDetails(): BrandApperanceDetails {
    return this.props.brandApperanceDetails;
  }
  get locationDetails(): LocationDetails {
    return this.props.locationDetails;
  }
  get bookingPolicies(): BookingPolicies {
    return this.props.bookingPolicies;
  }
  get bookingSetup(): BookingSetup {
    return this.props.bookingSetup;
  }
  get bookingContactFields(): BookingContactFields {
    return this.props.bookingContactFields;
  }
  get bookingCustomization(): BookingCustomization {
    return this.props.bookingCustomization;
  }
  get bookingLabelOverrides(): BookingLabelOverrides {
    return this.props.bookingLabelOverrides;
  }

  get businessHours(): BusinessHours {
    return this.props.businessHours;
  }

  // ── Notifications ──────────────────────────────────────────────────────────

  get teamNotifications(): BusinessTeamNotifications {
    return this.props.teamNotifications;
  }
  get customerNotifications(): BusinessCustomerNotifications {
    return this.props.customerNotifications;
  }
  get notificationCustomization(): BusinessNotificationCustomization {
    return this.props.notificationCustomization;
  }

  updateBrandDetails(value: {
    bannerImageUrl: string;
    logoUrl: string;
    name: string;
    slug: string;
    industry: BusinessIndustry;
    about: string;
    updatedBy: string;
  }): Business {
    return new Business({
      ...this.props,
      name: value.name,
      slug: value.slug,
      industry: value.industry,
      about: value.about,
      brandDetail: {
        bannerImageUrl: value.bannerImageUrl,
        brandLogoUrl: value.logoUrl,
      },
      updatedAt: new Date(),
      updatedBy: value.updatedBy,
    });
  }

  updateGeneral(value: { language: string; updatedBy: string }): Business {
    return new Business({
      ...this.props,
      locationDetails: {
        ...this.props.locationDetails,
        language: value.language,
      },
      updatedAt: new Date(),
      updatedBy: value.updatedBy,
    });
  }

  updateLocation(value: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    currency: SupportedCurrencies;
    updatedBy: string;
  }): Business {
    return new Business({
      ...this.props,
      locationDetails: {
        ...this.props.locationDetails,
        address: value.address,
        city: value.city,
        state: value.state,
        zip: value.zip,
        country: value.country,
        currency: value.currency,
      },
      updatedAt: new Date(),
      updatedBy: value.updatedBy,
    });
  }

  updateAppearance(value: {
    brandColor: string;
    brandButtonShape: BrandButtonShape;
    theme: BrandTheme;
    gallaryPhotosUrls: string[];
    updatedBy: string;
  }): Business {
    return new Business({
      ...this.props,
      brandApperanceDetails: {
        brandColor: value.brandColor,
        brandButtonShape: value.brandButtonShape,
        theme: value.theme,
        gallaryPhotosUrls: value.gallaryPhotosUrls,
      },
      updatedAt: new Date(),
      updatedBy: value.updatedBy,
    });
  }

  updateVisibility(value: { appearInSearchResults: boolean; updatedBy: string }): Business {
    return new Business({
      ...this.props,
      appearInSearchResults: value.appearInSearchResults,
      updatedAt: new Date(),
      updatedBy: value.updatedBy,
    });
  }

  updateBookingCustomization(value: {
    language: string;
    timeFormat: '12 hours' | '24 hours';
    weekStartsOn: WeekDay;
    showBookAnotherAppointmentButton: boolean;
    showServiceAndClassPrices: boolean;
    showServiceAndClassDuration: boolean;
    showBusinessHours: boolean;
    showLocalTime: boolean;
    labelService: string;
    labelClass: string;
    labelTeamMember: string;
    labelCity: string;
    labelState: string;
    labelPostalCode: string;
    termsLabel: string;
    termsLink: string;
    requireTermsAcceptance: boolean;
    redirectLabel: string;
    redirectLink: string;
    updatedBy: string;
  }): Business {
    return new Business({
      ...this.props,
      bookingCustomization: {
        language: value.language,
        timeFormat: value.timeFormat,
        weekStartsOn: value.weekStartsOn,
        showBookAnotherAppointmentButton: value.showBookAnotherAppointmentButton,
        showServiceAndClassPrices: value.showServiceAndClassPrices,
        showServiceAndClassDuration: value.showServiceAndClassDuration,
        showBusinessHours: value.showBusinessHours,
        showLocalTime: value.showLocalTime,
      },
      bookingLabelOverrides: {
        service: value.labelService,
        class: value.labelClass,
        teamMember: value.labelTeamMember,
        city: value.labelCity,
        state: value.labelState,
        postalCode: value.labelPostalCode,
        termsAndConditions: {
          label: value.termsLabel,
          link: value.termsLink,
          requireTermsAcceptance: value.requireTermsAcceptance,
        },
        redirection: {
          label: value.redirectLabel,
          link: value.redirectLink,
        },
      },
      updatedAt: new Date(),
      updatedBy: value.updatedBy,
    });
  }

  updateBookingSetup(value: {
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
    nameEnabled: boolean;
    nameRequired: boolean;
    emailEnabled: boolean;
    emailRequired: boolean;
    phoneEnabled: boolean;
    phoneRequired: boolean;
    addressEnabled: boolean;
    addressRequired: boolean;
    updatedBy: string;
  }): Business {
    return new Business({
      ...this.props,
      bookingSetup: {
        bookAppointmentSectionVisible: value.bookAppointmentSectionVisible,
        bookClassSectionVisible: value.bookClassSectionVisible,
        aboutUsSectionVisible: value.aboutUsSectionVisible,
        ourTeamSectionVisible: value.ourTeamSectionVisible,
        servicesSectionVisible: value.servicesSectionVisible,
        classesSectionVisible: value.classesSectionVisible,
        showFirstAvailable: value.showFirstAvailable,
        skipTeamSelection: value.skipTeamSelection,
        allowToBookMultipleServices: value.allowToBookMultipleServices,
        bypassTeamMemberSelection: value.bypassTeamMemberSelection,
        customerLoginEnabled: value.customerLoginEnabled,
        customerLoginRequired: value.customerLoginRequired,
        hidePikslotsBranding: value.hidePikslotsBranding,
        accordionView: value.accordionView,
        allowRescheduling: value.allowRescheduling,
        allowCancellations: value.allowCancellations,
        showBookNewButton: value.showBookNewButton,
      },
      bookingContactFields: {
        ...this.props.bookingContactFields,
        name: { enabled: value.nameEnabled, required: value.nameRequired },
        email: { enabled: value.emailEnabled, required: value.emailRequired },
        phone: { enabled: value.phoneEnabled, required: value.phoneRequired },
        address: { enabled: value.addressEnabled, required: value.addressRequired },
      },
      updatedAt: new Date(),
      updatedBy: value.updatedBy,
    });
  }

  updateBookingPolicies(value: {
    leadTime: { unit: TimeUnit; value: number };
    scheduleWindow: { unit: TimeUnit; value: number };
    cancellationPolicy: { unit: TimeUnit; value: number } | null;
    bookingPolicyText: string;
    showPolicyOnBookingPage: boolean;
    updatedBy: string;
  }): Business {
    return new Business({
      ...this.props,
      bookingPolicies: {
        leadTime: value.leadTime,
        scheduleWindow: value.scheduleWindow,
        cancellationPolicy: value.cancellationPolicy,
        bookingPolicyText: value.bookingPolicyText,
        showPolicyOnBookingPage: value.showPolicyOnBookingPage,
      },
      updatedAt: new Date(),
      updatedBy: value.updatedBy,
    });
  }

  updateBusinessHours({
    businessHours,
    updatedBy,
  }: {
    businessHours: BusinessHours;
    updatedBy: string;
  }): Business {
    return new Business({ ...this.props, businessHours, updatedAt: new Date(), updatedBy });
  }

  updateTeamNotifications(value: BusinessTeamNotifications & { updatedBy: string }): Business {
    const { updatedBy, ...teamNotifications } = value;
    return new Business({
      ...this.props,
      teamNotifications,
      updatedAt: new Date(),
      updatedBy,
    });
  }
  updateCustomerNotifications(
    value: BusinessCustomerNotifications & { updatedBy: string },
  ): Business {
    const { updatedBy, ...customerNotifications } = value;
    return new Business({ ...this.props, customerNotifications, updatedAt: new Date(), updatedBy });
  }
  updateNotificationCustomization(
    value: BusinessNotificationCustomization & { updatedBy: string },
  ): Business {
    const { updatedBy, ...notificationCustomization } = value;
    return new Business({
      ...this.props,
      notificationCustomization,
      updatedAt: new Date(),
      updatedBy,
    });
  }

  // ── Subscription ───────────────────────────────────────────────────────────

  get subscriptionPlan(): SubscriptionPlan {
    return this.props.subscriptionPlan;
  }
  get subscriptionStatus(): SubscriptionStatus {
    return this.props.subscriptionStatus;
  }
  get trialEndsAt(): Date | null {
    return this.props.trialEndsAt;
  }
  get isTrialing(): boolean {
    return (
      this.props.subscriptionStatus === 'trialing' &&
      this.props.trialEndsAt !== null &&
      this.props.trialEndsAt > new Date()
    );
  }

  // ── Audit fields ───────────────────────────────────────────────────────────

  get createdAt(): Date {
    return this.props.createdAt;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get updatedBy(): string {
    return this.props.updatedBy;
  }
  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }
  get deletedBy(): string | null {
    return this.props.deletedBy;
  }
  get isDeleted(): boolean {
    return this.props.isDeleted;
  }
}
