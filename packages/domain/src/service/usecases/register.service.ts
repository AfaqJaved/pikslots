import type { InfrastructureError, Result } from '../../shared';
import type { ServiceAlreadyExistsError } from '../errors';
import type { Service } from '../service.entity';

export interface RegisterServiceCommand {
  id: string;
  title: string;
  description: string;
  imagesUrls: string[];
  durationInMins: number;
  bufferTimeInMins: number;
  cost: number;
  businessId: string;
  createdBy: string;
}

export const IRegisterServiceUseCase = Symbol('IRegisterServiceUseCase');

export interface RegisterServiceUseCase {
  execute(
    command: RegisterServiceCommand,
  ): Promise<Result<Service, ServiceAlreadyExistsError | InfrastructureError>>;
}
