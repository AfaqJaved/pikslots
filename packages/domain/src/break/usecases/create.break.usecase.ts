import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { BreakConflictError } from '../errors';
import type { Break } from '../break.entity';
import type { WeekDay } from '../../shared';

export interface CreateBreakCommand {
  day: WeekDay;
  startTime: string;
  endTime: string;
  userId: string;
  businessId: string;
  createdBy: string;
}

export const ICreateBreakUseCase = Symbol('ICreateBreakUseCase');

export interface CreateBreakUseCase {
  execute(
    command: CreateBreakCommand,
  ): Promise<Result<Break, BreakConflictError | UnauthorizedError | InfrastructureError>>;
}
