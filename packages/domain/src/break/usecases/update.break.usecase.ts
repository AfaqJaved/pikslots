import type { Result, InfrastructureError } from '../../shared';
import type { BreakNotFoundError, BreakOverlapError, BreakNotOwnedError } from '../errors/index';
import type { Break } from '../break.entity';

export interface UpdateBreakCommand {
  readonly breakId: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly requesterId: string;
  readonly requesterRole: string;
}

export const IUpdateBreakUseCase = Symbol('IUpdateBreakUseCase');

export interface UpdateBreakUseCase {
  execute(
    command: UpdateBreakCommand,
  ): Promise<Result<Break, BreakNotFoundError | BreakOverlapError | BreakNotOwnedError | InfrastructureError>>;
}