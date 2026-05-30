import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business } from '../business.entity';

export interface UpdateBusinessGeneralCommand {
  id: string;
  language: string;
}

export const IUpdateBusinessGeneralUseCase = Symbol('IUpdateBusinessGeneralUseCase');

export interface UpdateBusinessGeneralUseCase {
  execute(
    command: UpdateBusinessGeneralCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>>;
}
