import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business } from '../business.entity';
import type { BusinessHours } from '../value-objects';

export interface UpdateBusinessHoursCommand {
  id: string;
  businessHours: BusinessHours;
}

export const IUpdateBusinessHoursUseCase = Symbol('IUpdateBusinessHoursUseCase');

export interface UpdateBusinessHoursUseCase {
  execute(
    command: UpdateBusinessHoursCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>>;
}
