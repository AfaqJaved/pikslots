import { Provider } from '@nestjs/common';
import { ICreateServiceGroupUseCase } from '@pikslots/domain';
import { CreateServiceGroupUseCaseImpl } from './create.service.group.usecase.impl';

export const SERVICE_GROUP_USECASES: Provider[] = [
  { useClass: CreateServiceGroupUseCaseImpl, provide: ICreateServiceGroupUseCase },
];
