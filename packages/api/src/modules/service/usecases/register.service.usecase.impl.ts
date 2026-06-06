import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IServiceRepository,
  ok,
  RegisterServiceCommand,
  RegisterServiceUseCase,
  Result,
  Service,
  ServiceAlreadyExistsError,
} from '@pikslots/domain';
import type { ServiceRepository } from '@pikslots/domain';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class RegisterServiceUseCaseImpl implements RegisterServiceUseCase {
  constructor(
    @Inject(IServiceRepository)
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(
    command: RegisterServiceCommand,
  ): Promise<Result<Service, ServiceAlreadyExistsError | InfrastructureError>> {
    const titleExists = await this.serviceRepository.existsByTitle(
      command.title,
      command.businessId,
    );

    if (!titleExists.ok) return err(titleExists.error);
    if (titleExists.value) {
      return err<ServiceAlreadyExistsError>({
        kind: 'service_already_exists',
        field: 'title',
        message: `A service named '${command.title}' already exists for this business`,
        timestamp: new Date(),
      });
    }

    const service = Service.create({
      id: uuidv7(),
      title: command.title,
      description: command.description,
      imagesUrls: command.imagesUrls,
      durationInMins: command.durationInMins,
      bufferTimeInMins: command.bufferTimeInMins,
      cost: command.cost,
      businessId: command.businessId,
      createdBy: command.createdBy,
    });

    const saved = await this.serviceRepository.save(service);
    if (!saved.ok) return err(saved.error);

    return ok(service);
  }
}
