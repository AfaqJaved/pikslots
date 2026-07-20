import { Inject } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IServiceRepository,
  ok,
  Result,
  Service,
  ServiceNotFoundError,
  type ServiceRepository,
  UnauthorizedError,
  UpdateServiceAvatarCommand,
  UpdateServiceAvatarUseCase,
} from '@pikslots/domain';
import {
  IPikslotS3Service,
  type PikslotS3Service,
} from 'src/shared/s3/s3.service';
import { SecurityContext } from 'src/shared/security/context/security.context';

export class UpdateServiceAvatarUseCaseImpl implements UpdateServiceAvatarUseCase {
  constructor(
    @Inject(IServiceRepository)
    private readonly serviceRepository: ServiceRepository,
    @Inject(IPikslotS3Service)
    private readonly s3Service: PikslotS3Service,
    private readonly securityContext: SecurityContext,
  ) {}
  async execute(
    command: UpdateServiceAvatarCommand,
  ): Promise<
    Result<
      Service,
      ServiceNotFoundError | UnauthorizedError | InfrastructureError
    >
  > {
    const serviceFound = await this.serviceRepository.findById(
      command.serviceId,
    );
    if (!serviceFound.ok) return err(serviceFound.error as InfrastructureError);

    const target = serviceFound.value;

    if (!target) {
      return err<ServiceNotFoundError>({
        kind: 'service_not_found',
        message: `service not found with id =${command.serviceId} `,
        by: 'id',
        timestamp: new Date(),
        value: command.serviceId,
      });
    }

    const callerRole = this.securityContext.role;
    const isPartOfSameBusiness =
      target.businessId === this.securityContext.businessId;

    if (!Service.canUpdateAvatar(callerRole, isPartOfSameBusiness)) {
      return err<UnauthorizedError>({
        kind: 'unauthorized',
        message: `Can not perform the operation Role ${this.securityContext.role}`,
        timestamp: new Date(),
      });
    }
    const updated = target.updateAvatarUrl(command.avatarKey);

    const updateAvatar = await this.serviceRepository.update(updated);
    if (!updateAvatar.ok) return err(updateAvatar.error);
    console.log('target.avatar ', target.serviceAvatar);

    if (target.serviceAvatar !== null) {
      await this.s3Service.deleteFile(target.serviceAvatar);
    }

    return ok(updated);
  }
}
