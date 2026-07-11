import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { BreakNotFoundError } from '../errors';

export interface DeleteBreakCommand {
  id: string;
  deletedBy: string;
}

export const IDeleteBreakUseCase = Symbol('IDeleteBreakUseCase');

export interface DeleteBreakUseCase {
  execute(
    command: DeleteBreakCommand,
  ): Promise<Result<void, BreakNotFoundError | UnauthorizedError | InfrastructureError>>;
}
