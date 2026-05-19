import { IRegisterBusinessUseCase } from '@pikslots/domain';
import { RegisterBusinessUseCaseImpl } from './register.business.usecase.impl';
import { Provider } from '@nestjs/common';

export const BUSINESS_USECASES: Provider[] = [
  {
    useClass: RegisterBusinessUseCaseImpl,
    provide: IRegisterBusinessUseCase,
  },
];
