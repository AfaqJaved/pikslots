import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IServiceGroupRepository,
  ok,
  CreateServiceGroupCommand,
  CreateServiceGroupUseCase,
  Result,
  ServiceGroup,
  ServiceGroupAlreadyExistsInBusinessError,
} from '@pikslots/domain';
import type { ServiceGroupRepository } from '@pikslots/domain';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class CreateServiceGroupUseCaseImpl implements CreateServiceGroupUseCase {
  constructor(
    @Inject(IServiceGroupRepository)
    private readonly serviceGroupRepository: ServiceGroupRepository,
  ) {}

  async execute(
    command: CreateServiceGroupCommand,
  ): Promise<Result<ServiceGroup, ServiceGroupAlreadyExistsInBusinessError | InfrastructureError>> {
    const nameExists = await this.serviceGroupRepository.existsByName(
      command.name,
      command.businessId,
    );

    if (!nameExists.ok) return err(nameExists.error);
    if (nameExists.value) {
      return err<ServiceGroupAlreadyExistsInBusinessError>({
        kind: 'service_group_already_exists',
        name: command.name,
        businessId: command.businessId,
        message: `A service group named '${command.name}' already exists for this business`,
        timestamp: new Date(),
      });
    }

    const group = ServiceGroup.create({
      id: uuidv7(),
      name: command.name,
      businessId: command.businessId,
      createdBy: command.createdBy,
    });

    const saved = await this.serviceGroupRepository.save(group);
    if (!saved.ok) return err(saved.error);

    return ok(group);
  }
}
