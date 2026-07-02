import type { UserRole } from '../user';
import type { recurrenceDomain } from './value-objects/recurrence.standard.vo';

// _________props___________________________________
export interface TimeoffProps {
  readonly id: string;
  readonly title: string;
  readonly userId: string;
  readonly businessId: string;
  readonly startDate: Date;
  readonly endDate: Date | null;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly recurrence: recurrenceDomain | null;
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
  startDate: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  recurrence?: recurrenceDomain;
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
      startDate: input.startDate,
      endDate: input.endDate || null,
      startTime: input.startTime || null,
      endTime: input.endTime || null,
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

  static canMakeTimeoff(
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
  static canDeletTimeoff(
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
    startDate: Date;
    endDate?: Date;
    startTime?: string;
    endTime?: string;
    recurrence?: recurrenceDomain;
    updatedBy: string;
    updatedAt: Date;
  }): Timeoff {
    return new Timeoff({
      ...this.props,
      title: input.title,
      startDate: input.startDate,
      endDate: input.endDate || null,
      startTime: input.startTime || null,
      endTime: input.endTime || null,
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
  get startDate(): Date {
    return this.props.startDate;
  }
  get endDate(): Date | null {
    return this.props.endDate;
  }
  get startTime(): string | null {
    return this.props.startTime;
  }
  get endTime(): string | null {
    return this.props.endTime;
  }
  get recurrence(): recurrenceDomain | null {
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
