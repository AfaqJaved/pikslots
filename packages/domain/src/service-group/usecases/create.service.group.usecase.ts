import type { InfrastructureError, Result } from '../../shared';
import type { ServiceGroupAlreadyExistsInBusinessError } from '../errors';
import type { ServiceGroup } from '../service.group.entity';

export interface CreateServiceGroupCommand {
  name: string;
  businessId: string;
  createdBy: string;
}

export const ICreateServiceGroupUseCase = Symbol('ICreateServiceGroupUseCase');

export interface CreateServiceGroupUseCase {
  execute(
    command: CreateServiceGroupCommand,
  ): Promise<Result<ServiceGroup, ServiceGroupAlreadyExistsInBusinessError | InfrastructureError>>;
}
