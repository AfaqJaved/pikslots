import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { ServiceNotFoundError } from '../errors';
import type { Service } from '../service.entity';

export interface UpdateServiceAvatarCommand {
  serviceId: string;
  avatarKey: string;
}

export const IUpdateServiceAvatarUseCase = Symbol('IUpdateServiceAvatarUseCase');

export interface UpdateServiceAvatarUseCase {
  execute(
    command: UpdateServiceAvatarCommand,
  ): Promise<Result<Service, ServiceNotFoundError | UnauthorizedError | InfrastructureError>>;
}
