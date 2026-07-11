import type { UserRole } from '../user';

// _________props___________________________________
export interface TimeoffProps {
  readonly id: string;
  readonly title: string;
  readonly userId: string;
  readonly businessId: string;
  readonly startDateTime: string; // iso 8601 date time string in utc only
  readonly endDateTime: string; // iso 8601 date time string in utc only
  readonly recurrence: string | null;
  // audit
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly updatedAt: Date;
  readonly updatedBy: string;
  readonly deletedAt: Date | null;
  readonly deletedBy: string | null;
  readonly isDeleted: boolean;
}

// ____createTimeoffInput____________________________________
export interface CreateTimeoffInput {
  id: string;
  title: string;
  userId: string;
  businessId: string;
  startDateTime: string;
  endDateTime: string;
  recurrence: string | null;
  createdBy: string;
  updatedBy: string;
}

export class Timeoff {
  private readonly props: TimeoffProps;
  constructor(props: TimeoffProps) {
    this.props = props;
  }

  static create(input: CreateTimeoffInput) {
    const now = new Date();
    return new Timeoff({
      id: input.id,
      title: input.title,
      userId: input.userId,
      businessId: input.businessId,
      startDateTime: input.startDateTime,
      endDateTime: input.endDateTime,
      recurrence: input.recurrence || null,
      createdAt: now,
      createdBy: input.createdBy,
      updatedAt: now,
      updatedBy: input.updatedBy,
      deletedAt: null,
      deletedBy: null,
      isDeleted: false,
    });
  }
  static reconstitute(props: TimeoffProps): Timeoff {
    return new Timeoff(props);
  }

  static canCreateTimeoff(
    callerRole: UserRole,
    isPartOfSameBusiness: boolean,
    isSelf: boolean,
  ): boolean {
    if (callerRole === 'Platform Owner') return true;
    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;
    if ((callerRole == 'Enhanced' || callerRole == 'Standard') && isPartOfSameBusiness && isSelf)
      return true;

    // No access
    return false;
  }
  static canViewTimeoff(
    callerRole: UserRole,
    isPartOfSameBusiness: boolean,
    isSelf: boolean,
  ): boolean {
    if (callerRole === 'Platform Owner') return true;
    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;
    if ((callerRole == 'Enhanced' || callerRole == 'Standard') && isPartOfSameBusiness && isSelf)
      return true;

    // No access
    return false;
  }

  static canUpdateTimeoff(
    callerRole: UserRole,
    isPartOfSameBusiness: boolean,
    isSelf: boolean,
  ): boolean {
    if (callerRole === 'Platform Owner') return true;
    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;
    if ((callerRole == 'Enhanced' || callerRole == 'Standard') && isPartOfSameBusiness && isSelf)
      return true;

    // No access
    return false;
  }
  static canDeleteTimeoff(
    callerRole: UserRole,
    isPartOfSameBusiness: boolean,
    isSelf: boolean,
  ): boolean {
    if (callerRole === 'Platform Owner') return true;
    if ((callerRole === 'Business Owner' || callerRole === 'Admin') && isPartOfSameBusiness)
      return true;
    if ((callerRole == 'Enhanced' || callerRole == 'Standard') && isPartOfSameBusiness && isSelf)
      return true;

    // No access
    return false;
  }

  // ___Mutution methods__________________________________________________
  update(input: {
    title: string;
    startDateTime: string;
    endDateTime: string;
    recurrence: string | null;
    updatedBy: string;
    updatedAt: Date;
  }): Timeoff {
    return new Timeoff({
      ...this.props,
      title: input.title,
      startDateTime: input.startDateTime,
      endDateTime: input.endDateTime,
      recurrence: input.recurrence || null,
      updatedBy: input.updatedBy,
      updatedAt: input.updatedAt,
    });
  }

  // ── Identity ───────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  equals(other: Timeoff): boolean {
    return this.props.id === other.props.id;
  }

  // _______ core fields ___________________________________________________

  get title(): string {
    return this.props.title;
  }
  get userId(): string {
    return this.props.userId;
  }
  get businessId(): string {
    return this.props.businessId;
  }
  get startDateTime(): string {
    return this.props.startDateTime;
  }
  get endDateTime(): string {
    return this.props.endDateTime;
  }
  get recurrence(): string | null {
    return this.props.recurrence;
  }
  // _________Audit fields _______________________________

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
