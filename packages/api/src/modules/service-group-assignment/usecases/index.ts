import { Provider } from '@nestjs/common';
import {
  IAssignServiceToGroupUseCase,
  IRemoveServiceFromGroupUseCase,
  IFindServicesByGroupUseCase,
  IFindGroupsByServiceUseCase,
} from '@pikslots/domain';
import { AssignServiceToGroupUseCaseImpl } from './assign.service.to.group.usecase.impl';
import { RemoveServiceFromGroupUseCaseImpl } from './remove.service.from.group.usecase.impl';
import { FindServicesByGroupUseCaseImpl } from './find.services.by.group.usecase.impl';
import { FindGroupsByServiceUseCaseImpl } from './find.groups.by.service.usecase.impl';

export const SERVICE_GROUP_ASSIGNMENT_USECASES: Provider[] = [
  { useClass: AssignServiceToGroupUseCaseImpl, provide: IAssignServiceToGroupUseCase },
  { useClass: RemoveServiceFromGroupUseCaseImpl, provide: IRemoveServiceFromGroupUseCase },
  { useClass: FindServicesByGroupUseCaseImpl, provide: IFindServicesByGroupUseCase },
  { useClass: FindGroupsByServiceUseCaseImpl, provide: IFindGroupsByServiceUseCase },
];
