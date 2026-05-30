import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business } from '../business.entity';

export interface UpdateBusinessVisibilityCommand {
  id: string;
  appearInSearchResults: boolean;
}

export const IUpdateBusinessVisibilityUseCase = Symbol('IUpdateBusinessVisibilityUseCase');

export interface UpdateBusinessVisibilityUseCase {
  execute(
    command: UpdateBusinessVisibilityCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>>;
}
