import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { TimeOffNotFound } from '../errors';
import type { Timeoff } from '../timeoff.entity';
import type { recurrenceDomain } from '../value-objects/recurrence.standard.vo';

export const IEditTimeOffByIdUseCase = Symbol('IEditTimeOffByIdUseCase');

export interface editTimeoffCommand {
  id: string;
  title: string;
  user_id: string;
  businessId: string;
  startDate: Date;
  endDate?: Date;
  startTime?: string;
  endTIme?: string;
  recurrence?: recurrenceDomain;
}

export interface EditTImeOffByIdUseCase {
  execute(
    command: editTimeoffCommand,
  ): Promise<Result<void, TimeOffNotFound | UnauthorizedError | InfrastructureError>>;
}
