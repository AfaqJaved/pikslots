import { Inject, Injectable } from '@nestjs/common';
import {
  IFindAllServicesByBusinessUseCase,
  IRegisterServiceUseCase,
  IEditServiceUseCase,
} from '@pikslots/domain';
import type {
  FindAllServicesByBusinessUseCase,
  RegisterServiceUseCase,
  EditServiceUseCase,
} from '@pikslots/domain';

@Injectable()
export class ServiceUseCasesFactory {
  @Inject(IRegisterServiceUseCase)
  public readonly registerServiceUseCase: RegisterServiceUseCase;

  @Inject(IFindAllServicesByBusinessUseCase)
  public readonly findAllServicesByBusinessUsecase: FindAllServicesByBusinessUseCase;

  @Inject(IEditServiceUseCase)
  public readonly editServiceUseCase: EditServiceUseCase;
}
