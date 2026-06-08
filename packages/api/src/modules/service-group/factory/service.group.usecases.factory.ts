import { Inject, Injectable } from '@nestjs/common';
import { ICreateServiceGroupUseCase } from '@pikslots/domain';
import type { CreateServiceGroupUseCase } from '@pikslots/domain';

@Injectable()
export class ServiceGroupUseCasesFactory {
  @Inject(ICreateServiceGroupUseCase)
  public readonly createServiceGroupUseCase: CreateServiceGroupUseCase;
}
