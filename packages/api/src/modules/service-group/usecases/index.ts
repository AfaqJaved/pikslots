import { Provider } from '@nestjs/common';
import {
  IFindAllServiceGroupsByBusinessUseCase,
  IRegisterServiceGroupUseCase,
} from '@pikslots/domain';
import { RegisterServiceGroupUseCaseImpl } from './register.service.group.usecase.impl';
import { FindAllServiceGroupsByBusinessUseCaseImpl } from './find.all.service.groups.by.business.usecase.impl';

export const SERVICE_GROUP_USECASES: Provider[] = [
  {
    useClass: RegisterServiceGroupUseCaseImpl,
    provide: IRegisterServiceGroupUseCase,
  },
  {
    useClass: FindAllServiceGroupsByBusinessUseCaseImpl,
    provide: IFindAllServiceGroupsByBusinessUseCase,
  },
];
