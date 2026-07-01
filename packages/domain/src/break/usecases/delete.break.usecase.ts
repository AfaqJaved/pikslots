import type { Result, InfrastructureError } from '../../shared';
import type { BreakNotFoundError, BreakNotOwnedError } from '../errors/index';

export interface DeleteBreakCommand {
  readonly breakId: string;
  // readonly requesterId: string;
  readonly requesterRole: string;
  readonly deletedBy: string;
}

export const IDeleteBreakUseCase = Symbol('IDeleteBreakUseCase');

export interface DeleteBreakUseCase {
  execute(
    command: DeleteBreakCommand,
  ): Promise<Result<void, BreakNotFoundError | BreakNotOwnedError | InfrastructureError>>;
}