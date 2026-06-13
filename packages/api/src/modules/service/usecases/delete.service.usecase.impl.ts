import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IServiceRepository,
  ok,
  Result,
  ServiceNotFoundError,
} from '@pikslots/domain';
import type { DeleteServiceUseCase, ServiceRepository } from '@pikslots/domain';

@Injectable()
export class DeleteServiceUseCaseImpl implements DeleteServiceUseCase {
  constructor(
    @Inject(IServiceRepository)
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(
    id: string,
  ): Promise<Result<void, ServiceNotFoundError | InfrastructureError>> {
    const deleteServiceResult = await this.serviceRepository.delete(id);

    if (!deleteServiceResult.ok) return err(deleteServiceResult.error);

    return ok(deleteServiceResult.value);
  }
}
