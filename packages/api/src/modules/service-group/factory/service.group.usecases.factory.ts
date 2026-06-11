import { Inject, Injectable } from '@nestjs/common';
import {
  IFindAllServiceGroupsByBusinessUseCase,
  IRegisterServiceGroupUseCase,
} from '@pikslots/domain';
import type {
  FindAllServiceGroupsByBusinessUseCase,
  RegisterServiceGroupUseCase,
} from '@pikslots/domain';

@Injectable()
export class ServiceGroupUseCasesFactory {
  @Inject(IRegisterServiceGroupUseCase)
  public readonly registerServiceGroupUseCase: RegisterServiceGroupUseCase;

  @Inject(IFindAllServiceGroupsByBusinessUseCase)
  public readonly findAllServiceGroupsByBusinessUseCase: FindAllServiceGroupsByBusinessUseCase;
}
