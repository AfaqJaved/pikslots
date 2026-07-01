import type { Result, InfrastructureError,UnauthorizedError } from '../../shared';
import type { BreakOverlapError } from '../errors/index.ts';
import type { Break, BreakDay } from '../break.entity';

export interface CreateBreakCommand {
  readonly userId: string | null;
  readonly day: BreakDay;
  readonly buisnessId : string | null;
  readonly startTime: string;
  readonly endTime: string;
  readonly requestedBy: string;
}

export const ICreateBreakUseCase = Symbol('ICreateBreakUseCase');

export interface CreateBreakUseCase {
  execute(
    command: CreateBreakCommand,
  ): Promise<Result<Break, BreakOverlapError | InfrastructureError | UnauthorizedError>>;
}