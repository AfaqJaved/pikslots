import { type UnauthorizedError, type InfrastructureError, type Result } from '../../shared';
import type { TimeOffNotFound } from '../errors';

export const IDeleteTimeoffUseCase = Symbol('IDeleteTimeOffUseCase');

export interface DeleteTimeoffUseCase {
  execute(
    id: string,
  ): Promise<Result<void, TimeOffNotFound | UnauthorizedError | InfrastructureError>>;
}
