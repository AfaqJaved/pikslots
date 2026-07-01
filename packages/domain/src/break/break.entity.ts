// ── Props ─────────────────────────────────────────────────────────────────────

import type { WeekDay } from '../shared';
import type { UserRole } from '../user/types';

export interface BreakProps {
  readonly id: string;
  readonly day: WeekDay;
  readonly startTime: string;
  readonly endTime: string;
  readonly userId: string;
  readonly businessId: string;
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

export interface CreateBreakInput {
  id: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
  userId: string;
  businessId: string;
  createdBy: string;
}

// ── Update input ──────────────────────────────────────────────────────────────

export interface UpdateBreakInput {
  day?: WeekDay;
  startTime?: string;
  endTime?: string;
  updatedBy: string;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class Break {
  private readonly props: BreakProps;

  private constructor(props: BreakProps) {
    this.props = props;
  }

  /**
   * Creates a brand-new Break with defaults applied.
   * Use this in application use-cases, never for rehydrating persisted data.
   */
  static create(input: CreateBreakInput): Break {
    const now = new Date();
    return new Break({
      id: input.id,
      day: input.day,
      startTime: input.startTime,
      endTime: input.endTime,
      businessId: input.businessId,
      userId: input.userId,
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
   * Reconstitutes a Break from already-validated data (e.g. a database row).
   * Never call with raw untrusted input.
   */
  static reconstitute(props: BreakProps): Break {
    return new Break(props);
  }

  // ── Business rules ─────────────────────────────────────────────────────────

  static canCreateBreak(role: UserRole, isSelf: boolean, isPartOfSameBusiness: boolean): boolean {
    if (role === 'Platform Owner') return true;
    if ((role === 'Business Owner' || role === 'Admin') && isPartOfSameBusiness) return true;
    if (isSelf && (role === 'Enhanced' || role === 'Standard')) return true;
    return false;
  }

  static canDeleteBreak(role: UserRole, isSelf: boolean, isPartOfSameBusiness: boolean): boolean {
    if (role === 'Platform Owner') return true;
    if ((role === 'Business Owner' || role === 'Admin') && isPartOfSameBusiness) return true;
    if (isSelf && (role === 'Enhanced' || role === 'Standard')) return true;
    return false;
  }

  static canViewBreaks(role: UserRole, isSelf: boolean, isPartOfSameBusiness: boolean): boolean {
    if (role === 'Platform Owner') return true;
    if ((role === 'Business Owner' || role === 'Admin') && isPartOfSameBusiness) return true;
    if (isSelf && (role === 'Enhanced' || role === 'Standard')) return true;
    return false;
  }

  static canUpdateBreak(role: UserRole, isSelf: boolean, isPartOfSameBusiness: boolean): boolean {
    if (role === 'Platform Owner') return true;
    if ((role === 'Business Owner' || role === 'Admin') && isPartOfSameBusiness) return true;
    if (isSelf && (role === 'Enhanced' || role === 'Standard')) return true;
    return false;
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  update(input: UpdateBreakInput): Break {
    return new Break({
      ...this.props,
      day: input.day ?? this.props.day,
      startTime: input.startTime ?? this.props.startTime,
      endTime: input.endTime ?? this.props.endTime,
      updatedAt: new Date(),
      updatedBy: input.updatedBy,
    });
  }

  // ── Identity ───────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  equals(other: Break): boolean {
    return this.props.id === other.props.id;
  }

  // ── Core fields ────────────────────────────────────────────────────────────

  get day(): WeekDay {
    return this.props.day;
  }

  get startTime(): string {
    return this.props.startTime;
  }

  get endTime(): string {
    return this.props.endTime;
  }

  get userId(): string {
    return this.props.userId;
  }

  get businessId(): string {
    return this.props.businessId;
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
