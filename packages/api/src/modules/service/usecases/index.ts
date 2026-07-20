import { Provider } from '@nestjs/common';
import {
  IFindAllServicesByBusinessUseCase,
  IRegisterServiceUseCase,
  IEditServiceUseCase,
  IDeleteServiceUseCase,
  IUpdateServiceAvatarUseCase,
} from '@pikslots/domain';
import { RegisterServiceUseCaseImpl } from './register.service.usecase.impl';
import { FindAllServicesByBusinessUseCaseImpl } from './find.all.services.by.business.usecase.impl';
import { EditServiceUseCaseImpl } from './edit.service.usecase.impl';
import { DeleteServiceUseCaseImpl } from './delete.service.usecase.impl';
import { UpdateServiceAvatarUseCaseImpl } from './update.service.avatar.usecase.impl';

export const SERVICE_USECASES: Provider[] = [
  { useClass: RegisterServiceUseCaseImpl, provide: IRegisterServiceUseCase },
  {
    useClass: FindAllServicesByBusinessUseCaseImpl,
    provide: IFindAllServicesByBusinessUseCase,
  },
  { useClass: EditServiceUseCaseImpl, provide: IEditServiceUseCase },
  { useClass: DeleteServiceUseCaseImpl, provide: IDeleteServiceUseCase },
  {
    useClass: UpdateServiceAvatarUseCaseImpl,
    provide: IUpdateServiceAvatarUseCase,
  },
];
