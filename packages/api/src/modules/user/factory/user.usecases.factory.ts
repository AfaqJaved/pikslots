import { Inject, Injectable } from '@nestjs/common';
import {
  ILoginUserUseCase,
  IRefreshUserSessionUseCase,
  IRegisterUseCase,
} from '@pikslots/domain';
import type {
  LoginUserUseCase,
  RefreshUserSessionUseCase,
  RegisterUserUseCase,
} from '@pikslots/domain';

@Injectable()
export class UserUsecasesFactory {
  @Inject(IRegisterUseCase)
  public readonly registerUserUsecase: RegisterUserUseCase;

  @Inject(ILoginUserUseCase)
  public readonly loginUserUseCase: LoginUserUseCase;

  @Inject(IRefreshUserSessionUseCase)
  public readonly refreshUserSessionUseCase: RefreshUserSessionUseCase;
}
