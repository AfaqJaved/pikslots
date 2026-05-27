import { Inject, Injectable } from '@nestjs/common';
import {
  IFindUserByIdUseCase,
  IGetAllBusinessOwnersUseCase,
  IGetUserProfileUseCase,
  IInviteUserUseCase,
  ILoginUserUseCase,
  IRefreshUserSessionUseCase,
} from '@pikslots/domain';
import type {
  FindUserByIdUseCase,
  GetAllBusinessOwnersUseCase,
  GetUserProfileUseCase,
  InviteUserUseCase,
  LoginUserUseCase,
  RefreshUserSessionUseCase,
} from '@pikslots/domain';

@Injectable()
export class UserUsecasesFactory {
  @Inject(IInviteUserUseCase)
  public readonly inviteUserUseCase: InviteUserUseCase;

  @Inject(IFindUserByIdUseCase)
  public readonly findUserByIdUseCase: FindUserByIdUseCase;

  @Inject(IGetUserProfileUseCase)
  public readonly getUserProfileUseCase: GetUserProfileUseCase;

  @Inject(IGetAllBusinessOwnersUseCase)
  public readonly getAllBusinessOwnersUseCase: GetAllBusinessOwnersUseCase;

  @Inject(ILoginUserUseCase)
  public readonly loginUserUseCase: LoginUserUseCase;

  @Inject(IRefreshUserSessionUseCase)
  public readonly refreshUserSessionUseCase: RefreshUserSessionUseCase;
}
