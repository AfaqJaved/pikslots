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
} from '@pikslots/domain';
import type { ServiceRepository, UnauthorizedError } from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { v7 as uuidv7 } from 'uuid';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not register service : unauthorized!!!',
  timestamp: new Date(),
};

@Injectable()
export class RegisterServiceUseCaseImpl implements RegisterServiceUseCase {
  constructor(
    @Inject(IServiceRepository)
    private readonly serviceRepository: ServiceRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: RegisterServiceCommand,
  ): Promise<Result<Service, UnauthorizedError | InfrastructureError>> {
    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const isPartOfSameBusiness = callerBusinessId === command.businessId;

    if (!Service.canRegisterService(callerRole, isPartOfSameBusiness))
      return err(UNAUTHORIZED_ERROR);

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
