import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { CreateTimeoffInput, Timeoff } from '../timeoff.entity';
import type { recurrenceDomain } from '../value-objects';

export interface CreateTimeoff {
  title: string;
  userId: string;
  businessId: string;
  startDate: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  recurrence?: recurrenceDomain;
}

export const ISaveTImeOffUseCase = Symbol('ISaveTimeoffUseCase');

export interface SaveTimeOffUseCase {
  execute(
    command: CreateTimeoff,
  ): Promise<Result<Timeoff, UnauthorizedError | InfrastructureError>>;
}
