import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business } from '../business.entity';
import type { BusinessLinks } from '../value-objects';

export interface UpdateBusinessLinksCommand {
  id: string;
  businessLinks: BusinessLinks;
}

export const IUpdateBusinessLinksUseCase = Symbol('IUpdateBusinessLinksUseCase');

export interface UpdateBusinessLinksUseCase {
  execute(
    command: UpdateBusinessLinksCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>>;
}
