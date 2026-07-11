import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { BreakNotFoundError, BreakConflictError } from '../errors';
import type { Break } from '../break.entity';
import type { WeekDay } from '../../shared';

export interface UpdateBreakCommand {
  id: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
  updatedBy: string;
}

export const IUpdateBreakUseCase = Symbol('IUpdateBreakUseCase');

export interface UpdateBreakUseCase {
  execute(
    command: UpdateBreakCommand,
  ): Promise<
    Result<Break, BreakNotFoundError | BreakConflictError | UnauthorizedError | InfrastructureError>
  >;
}
