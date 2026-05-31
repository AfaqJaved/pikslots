import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business } from '../business.entity';
import type { BusinessContactDetails } from '../value-objects';

export interface UpdateBusinessContactDetailsCommand {
  id: string;
  contactDetails: BusinessContactDetails;
}

export const IUpdateBusinessContactDetailsUseCase = Symbol('IUpdateBusinessContactDetailsUseCase');

export interface UpdateBusinessContactDetailsUseCase {
  execute(
    command: UpdateBusinessContactDetailsCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>>;
}
