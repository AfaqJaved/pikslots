import { Provider } from '@nestjs/common';
import { RegisterUserUsecaseImpl } from './register.user.usecase.impl';
import {
  ILoginUserUseCase,
  IRefreshUserSessionUseCase,
  IRegisterUseCase,
} from '@pikslots/domain';
import { LoginUserUseCaseImpl } from './login.user.usecase.impl';
import { RefreshUserSessionUseCaseImpl } from './refresh.user.session.usecase.impl';

export const USER_USECASES: Provider[] = [
  { useClass: RegisterUserUsecaseImpl, provide: IRegisterUseCase },
  { useClass: LoginUserUseCaseImpl, provide: ILoginUserUseCase },
  {
    useClass: RefreshUserSessionUseCaseImpl,
    provide: IRefreshUserSessionUseCase,
  },
];
