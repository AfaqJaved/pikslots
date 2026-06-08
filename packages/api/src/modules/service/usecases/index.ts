import { Provider } from '@nestjs/common';
import { IRegisterServiceUseCase } from '@pikslots/domain';
import { RegisterServiceUseCaseImpl } from './register.service.usecase.impl';

export const SERVICE_USECASES: Provider[] = [
  { useClass: RegisterServiceUseCaseImpl, provide: IRegisterServiceUseCase },
];
