import { Inject, Injectable } from '@nestjs/common';
import { ILoginUserUseCase, IRegisterUseCase } from '@pickslots/domain';
import type { LoginUserUseCase, RegisterUserUseCase } from '@pickslots/domain';

@Injectable()
export class UserUsecasesFactory {
  @Inject(IRegisterUseCase)
  public readonly registerUserUsecase: RegisterUserUseCase;

  @Inject(ILoginUserUseCase)
  public readonly loginUserUseCase: LoginUserUseCase;
}
