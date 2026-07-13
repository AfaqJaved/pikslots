import { Inject, Injectable } from '@nestjs/common';
import {
  IAssignUserToServiceUseCase,
  IRemoveUserFromServiceUseCase,
  IFindUsersByServiceUseCase,
  IFindServicesByUserUseCase,
} from '@pikslots/domain';
import type {
  AssignUserToServiceUseCase,
  RemoveUserFromServiceUseCase,
  FindUsersByServiceUseCase,
  FindServicesByUserUseCase,
} from '@pikslots/domain';

@Injectable()
export class ServiceUserAssignmentUseCasesFactory {
  @Inject(IAssignUserToServiceUseCase)
  public readonly assignUserToServiceUseCase: AssignUserToServiceUseCase;

  @Inject(IRemoveUserFromServiceUseCase)
  public readonly removeUserFromServiceUseCase: RemoveUserFromServiceUseCase;

  @Inject(IFindUsersByServiceUseCase)
  public readonly findUsersByServiceUseCase: FindUsersByServiceUseCase;

  @Inject(IFindServicesByUserUseCase)
  public readonly findServicesByUserUseCase: FindServicesByUserUseCase;
}
