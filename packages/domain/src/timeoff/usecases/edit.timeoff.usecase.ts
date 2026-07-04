import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { TimeOffNotFound } from '../errors';
import type { EditTimeoffCommand } from '../types';

export const IEditTimeOffByIdUseCase = Symbol('IEditTimeOffByIdUseCase');

export interface EditTImeOffByIdUseCase {
  execute(
    command: EditTimeoffCommand,
  ): Promise<Result<void, TimeOffNotFound | UnauthorizedError | InfrastructureError>>;
}
