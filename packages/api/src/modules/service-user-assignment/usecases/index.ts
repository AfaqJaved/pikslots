import { Provider } from '@nestjs/common';
import {
  IAssignUserToServiceUseCase,
  IRemoveUserFromServiceUseCase,
  IFindUsersByServiceUseCase,
  IFindServicesByUserUseCase,
} from '@pikslots/domain';
import { AssignUserToServiceUseCaseImpl } from './assign.user.to.service.usecase.impl';
import { RemoveUserFromServiceUseCaseImpl } from './remove.user.from.service.usecase.impl';
import { FindUsersByServiceUseCaseImpl } from './find.users.by.service.usecase.impl';
import { FindServicesByUserUseCaseImpl } from './find.services.by.user.usecase.impl';

export const SERVICE_USER_ASSIGNMENT_USECASES: Provider[] = [
  {
    useClass: AssignUserToServiceUseCaseImpl,
    provide: IAssignUserToServiceUseCase,
  },
  {
    useClass: RemoveUserFromServiceUseCaseImpl,
    provide: IRemoveUserFromServiceUseCase,
  },
  {
    useClass: FindUsersByServiceUseCaseImpl,
    provide: IFindUsersByServiceUseCase,
  },
  {
    useClass: FindServicesByUserUseCaseImpl,
    provide: IFindServicesByUserUseCase,
  },
];
