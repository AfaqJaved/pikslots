// ── Props ─────────────────────────────────────────────────────────────────────

export type BreakDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface BreakProps {
  readonly id: string;
  readonly userId: string;
  readonly day: BreakDay;
  readonly startTime: string; // 'HH:MM'
  readonly endTime: string; // 'HH:MM'
  readonly businessId: string;
  // audit
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly updatedAt: Date;
  readonly updatedBy: string;
  readonly deletedAt: Date | null; // ← add
  readonly deletedBy: string | null; // ← add
  readonly isDeleted: boolean;
}

// ── Create input ──────────────────────────────────────────────────────────────

export interface CreateBreakInput {
  id: string;
  userId: string;
  day: BreakDay;
  buisnessId: string;
  startTime: string;
  endTime: string;
  createdBy: string;
}

// ── Entity ────────────────────────────────────────────────────────────────────

export class Break {
  private readonly props: BreakProps;

  private constructor(props: BreakProps) {
    this.props = props;
  }

  /**
   * Creates a brand-new Break.
   * Use this in use-cases, never for rehydrating persisted data.
   */
  static create(input: CreateBreakInput): Break {
    const now = new Date();
    return new Break({
      id: input.id,
      userId: input.userId,
      day: input.day,
      startTime: input.startTime,
      endTime: input.endTime,
      businessId: input.buisnessId,
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
   * Reconstitutes a Break from a validated database row.
   * Never call with raw untrusted input.
   */
  static reconstitute(props: BreakProps): Break {
    return new Break(props);
  }

  // ── Business rules ─────────────────────────────────────────────────────────

  /**
   * Returns true if this break's time window overlaps with another break.
   * Two breaks overlap if one starts before the other ends.
   * Example: 10:00–11:00 overlaps with 10:30–12:00, but NOT with 11:00–12:00.
   */
  overlapsWith(other: Break): boolean {
    if (this.props.day !== other.props.day) return false;
    return this.props.startTime < other.props.endTime && this.props.endTime > other.props.startTime;
  }

  /**
   * A user can only manage their own breaks unless they are an Admin+ role.
   * The actual role check happens in the use-case using User.canUpdateWorkingHours
   * as a reference pattern — the entity just exposes ownership.
   */
  isOwnedBy(userId: string): boolean {
    return this.props.userId === userId;
  }

  // ── Identity ───────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  equals(other: Break): boolean {
    return this.props.id === other.props.id;
  }

  // ── Core fields ────────────────────────────────────────────────────────────

  get userId(): string {
    return this.props.userId;
  }
  get buisnessId(): string {
    return this.props.businessId;
  }
  get day(): BreakDay {
    return this.props.day;
  }
  get startTime(): string {
    return this.props.startTime;
  }
  get endTime(): string {
    return this.props.endTime;
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

  // ── Mutations (return new instance — immutable pattern) ────────────────────

  updateTime({
    startTime,
    endTime,
    updatedBy,
  }: {
    startTime: string;
    endTime: string;
    updatedBy: string;
  }): Break {
    return new Break({
      ...this.props,
      startTime,
      endTime,
      updatedAt: new Date(),
      updatedBy,
    });
  }
}
