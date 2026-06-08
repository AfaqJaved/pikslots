import { Inject, Injectable } from '@nestjs/common';
import { IRegisterServiceUseCase } from '@pikslots/domain';
import type { RegisterServiceUseCase } from '@pikslots/domain';

@Injectable()
export class ServiceUseCasesFactory {
  @Inject(IRegisterServiceUseCase)
  public readonly registerServiceUseCase: RegisterServiceUseCase;
}
