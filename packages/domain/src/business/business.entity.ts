// ── Types ─────────────────────────────────────────────────────────────────────

export type BusinessStatus = 'pending_setup' | 'active' | 'inactive' | 'suspended';

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

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled';

// ── Value objects ─────────────────────────────────────────────────────────────

export interface BookingSettings {
  readonly allowOnlineBooking: boolean;
  readonly requiresConfirmation: boolean;  // manual confirmation by staff before booking is confirmed
  readonly cancellationWindowHours: number; // minimum notice required to cancel
  readonly bookingWindowDays: number;       // how far ahead customers can book
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface BusinessProps {
  readonly id: string;
  readonly ownerId: string;         // references User.id (businessOwner role)
  readonly slug: string;            // unique, URL-friendly tenant identifier e.g. "joes-barbershop"
  readonly name: string;
  readonly description: string | null;
  readonly industry: BusinessIndustry;
  readonly address: string;
  readonly email: string;
  readonly phone: string | null;
  readonly website: string | null;
  readonly logo: string | null;
  readonly status: BusinessStatus;
  readonly suspendedReason: string | null;
  // locale
  readonly defaultTimeZone: string;
  readonly defaultCurrency: string; // ISO 4217 e.g. 'USD', 'PKR'
  readonly defaultLanguage: string; // BCP 47 e.g. 'en', 'ur'
  // booking config
  readonly bookingSettings: BookingSettings;
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
  address: string;
  email: string;
  phone?: string;
  description?: string;
  website?: string;
  defaultTimeZone?: string;
  defaultCurrency?: string;
  defaultLanguage?: string;
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
      description: input.description ?? null,
      industry: input.industry,
      address: input.address,
      email: input.email,
      phone: input.phone ?? null,
      website: input.website ?? null,
      logo: null,
      status: 'pending_setup',
      suspendedReason: null,
      defaultTimeZone: input.defaultTimeZone ?? 'UTC',
      defaultCurrency: input.defaultCurrency ?? 'USD',
      defaultLanguage: input.defaultLanguage ?? 'en',
      bookingSettings: {
        allowOnlineBooking: true,
        requiresConfirmation: false,
        cancellationWindowHours: 24,
        bookingWindowDays: 30,
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
  get description(): string | null {
    return this.props.description;
  }
  get industry(): BusinessIndustry {
    return this.props.industry;
  }
  get address(): string {
    return this.props.address;
  }
  get email(): string {
    return this.props.email;
  }
  get phone(): string | null {
    return this.props.phone;
  }
  get website(): string | null {
    return this.props.website;
  }
  get logo(): string | null {
    return this.props.logo;
  }
  get status(): BusinessStatus {
    return this.props.status;
  }
  get suspendedReason(): string | null {
    return this.props.suspendedReason;
  }

  // ── Locale ─────────────────────────────────────────────────────────────────

  get defaultTimeZone(): string {
    return this.props.defaultTimeZone;
  }
  get defaultCurrency(): string {
    return this.props.defaultCurrency;
  }
  get defaultLanguage(): string {
    return this.props.defaultLanguage;
  }

  // ── Booking config ─────────────────────────────────────────────────────────

  get bookingSettings(): BookingSettings {
    return this.props.bookingSettings;
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
