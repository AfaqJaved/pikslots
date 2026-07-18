import type { InfrastructureError, Result } from '../../shared';
import type { ServiceUserAssignmentAlreadyExistsError } from '../errors';
import type { ServiceUserAssignment } from '../service.user.assignment.entity';

export interface AssignUserToServiceCommand {
  serviceId: string;
  userId: string;
  businessId: string;
  createdBy: string;
}

export const IAssignUserToServiceUseCase = Symbol('IAssignUserToServiceUseCase');

export interface AssignUserToServiceUseCase {
  execute(
    command: AssignUserToServiceCommand,
  ): Promise<
    Result<ServiceUserAssignment, ServiceUserAssignmentAlreadyExistsError | InfrastructureError>
  >;
}
