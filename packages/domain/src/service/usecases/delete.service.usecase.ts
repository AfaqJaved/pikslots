import type { InfrastructureError, Result } from '../../shared';
import type { ServiceNotFoundError } from '../errors';

export const IDeleteServiceUseCase = Symbol('IDeleteServiceUseCase');

export interface DeleteServiceUseCase {
  execute(id: string): Promise<Result<void, ServiceNotFoundError | InfrastructureError>>;
}
