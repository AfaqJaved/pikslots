import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  InfrastructureError,
  IServiceUserAssignmentRepository,
  Result,
  ServiceUserAssignment,
  ServiceUserAssignmentAlreadyExistsError,
  AssignUserToServiceCommand,
  AssignUserToServiceUseCase,
} from '@pikslots/domain';
import type { ServiceUserAssignmentRepository } from '@pikslots/domain';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class AssignUserToServiceUseCaseImpl implements AssignUserToServiceUseCase {
  constructor(
    @Inject(IServiceUserAssignmentRepository)
    private readonly assignmentRepository: ServiceUserAssignmentRepository,
  ) {}

  async execute(
    command: AssignUserToServiceCommand,
  ): Promise<
    Result<
      ServiceUserAssignment,
      ServiceUserAssignmentAlreadyExistsError | InfrastructureError
    >
  > {
    const exists = await this.assignmentRepository.existsByServiceAndUser(
      command.serviceId,
      command.userId,
    );

    if (!exists.ok) return err(exists.error);

    if (exists.value) {
      return err<ServiceUserAssignmentAlreadyExistsError>({
        kind: 'service_user_assignment_already_exists',
        serviceId: command.serviceId,
        userId: command.userId,
        message: `User '${command.userId}' is already assigned to service '${command.serviceId}'`,
        timestamp: new Date(),
      });
    }

    const assignment = ServiceUserAssignment.create({
      id: uuidv7(),
      serviceId: command.serviceId,
      userId: command.userId,
      businessId: command.businessId,
      createdBy: command.createdBy,
    });

    const saved = await this.assignmentRepository.save(assignment);

    if (!saved.ok) return err(saved.error);

    return ok(assignment);
  }
}
