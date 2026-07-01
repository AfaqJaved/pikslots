import { Provider } from '@nestjs/common';
import { FindTimeOffByIdUseCaseImpl } from './find.timeoff.usecase.impl';
import {
  IDeleteTimeoffUseCase,
  IEditTimeOffByIdUseCase,
  IFindAllTime0ffByUserUseCase,
  IFindTime0ffByIdUseCase,
  ISaveTImeOffUseCase,
} from '@pikslots/domain';
import { FindAllTimeOffByUserUseCaseImpl } from './findall.timeoff.usecase.impl';
import { EditTimeoffByIdUseCaseImpl } from './edit.timeoff.usecase.impl';
import { SaveTimeOffUseCaseImpl } from './save.timeoff.usecase.impl';
import { DeleteTimeoffUseCaseImpl } from './delete.timeoff.usecase.impl';

export const TIMEOFF_USECASES: Provider[] = [
  { useClass: FindTimeOffByIdUseCaseImpl, provide: IFindTime0ffByIdUseCase },
  {
    useClass: FindAllTimeOffByUserUseCaseImpl,
    provide: IFindAllTime0ffByUserUseCase,
  },
  {
    useClass: EditTimeoffByIdUseCaseImpl,
    provide: IEditTimeOffByIdUseCase,
  },
  {
    useClass: SaveTimeOffUseCaseImpl,
    provide: ISaveTImeOffUseCase,
  },
  {
    useClass: DeleteTimeoffUseCaseImpl,
    provide: IDeleteTimeoffUseCase,
  },
];
