import { Provider } from '@nestjs/common';
import {
  IFindAllServicesByBusinessUseCase,
  IRegisterServiceUseCase,
  IEditServiceUseCase,
} from '@pikslots/domain';
import { RegisterServiceUseCaseImpl } from './register.service.usecase.impl';
import { FindAllServicesByBusinessUseCaseImpl } from './find.all.services.by.business.usecase.impl';
import { EditServiceUseCaseImpl } from './edit.service.usecase.impl';

export const SERVICE_USECASES: Provider[] = [
  { useClass: RegisterServiceUseCaseImpl, provide: IRegisterServiceUseCase },
  {
    useClass: FindAllServicesByBusinessUseCaseImpl,
    provide: IFindAllServicesByBusinessUseCase,
  },
  { useClass: EditServiceUseCaseImpl, provide: IEditServiceUseCase },
];
