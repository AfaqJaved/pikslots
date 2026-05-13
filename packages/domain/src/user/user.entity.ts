// ── Enums ─────────────────────────────────────────────────────────────────────

export type UserRole = 'superAdmin' | 'businessOwner' | 'locationOwner';

export type UserStatus = 'pending_verification' | 'active' | 'inactive' | 'suspended';

// ── Value objects ─────────────────────────────────────────────────────────────

export interface FullName {
  readonly firstName: string;
  readonly lastName: string;
}

export interface NotificationPreferences {
  readonly email: boolean;
  readonly sms: boolean;
  readonly push: boolean;
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface UserProps {
  readonly id: string;
  readonly username: string;
  readonly password: string;
  readonly name: FullName;
  readonly email: string;
  readonly phone: string | null;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly timezone: string;
  readonly avatarUrl: string | null;
  readonly emailVerified: boolean;
  readonly notificationPreferences: NotificationPreferences;
  readonly lastLoginAt: Date | null;
  readonly suspendedReason: string | null;
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

export interface CreateUserInput {
  id: string;
  username: string;
  password: string;
  name: FullName;
  email: string;
  phone?: string;
  role: UserRole;
  timezone?: string;
  createdBy: string;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class User {
  private readonly props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  /**
   * Creates a brand-new User with business defaults applied.
   * Use this in application use-cases, never for rehydrating persisted data.
   */
  static create(input: CreateUserInput): User {
    const now = new Date();
    return new User({
      id: input.id,
      username: input.username,
      password: input.password,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      role: input.role,
      status: 'pending_verification',
      timezone: input.timezone ?? 'UTC',
      avatarUrl: null,
      emailVerified: false,
      notificationPreferences: { email: true, sms: false, push: false },
      lastLoginAt: null,
      suspendedReason: null,
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
   * Reconstitutes a User from already-validated data (e.g. a database row
   * decoded through UserSchema). Never call with raw untrusted input.
   */
  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // ── Identity ───────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  equals(other: User): boolean {
    return this.props.id === other.props.id;
  }

  // ── Core fields ────────────────────────────────────────────────────────────

  get username(): string {
    return this.props.username;
  }
  get password(): string {
    return this.props.password;
  }
  get name(): FullName {
    return this.props.name;
  }
  get email(): string {
    return this.props.email;
  }
  get phone(): string | null {
    return this.props.phone;
  }
  get role(): UserRole {
    return this.props.role;
  }
  get status(): UserStatus {
    return this.props.status;
  }
  get timezone(): string {
    return this.props.timezone;
  }
  get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }
  get emailVerified(): boolean {
    return this.props.emailVerified;
  }
  get notificationPreferences(): NotificationPreferences {
    return this.props.notificationPreferences;
  }
  get lastLoginAt(): Date | null {
    return this.props.lastLoginAt;
  }
  get suspendedReason(): string | null {
    return this.props.suspendedReason;
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
