import { Provider } from '@nestjs/common';
import { RegisterUserUsecaseImpl } from './register.user.usecase.impl';
import { ILoginUserUseCase, IRegisterUseCase } from '@pickslots/domain';
import { LoginUserUseCaseImpl } from './login.user.usecase.impl';

export const USER_USECASES: Provider[] = [
  { useClass: RegisterUserUsecaseImpl, provide: IRegisterUseCase },
  { useClass: LoginUserUseCaseImpl, provide: ILoginUserUseCase },
];
