import { Provider } from '@nestjs/common';
import {
  ICreateBreakUseCase,
  IUpdateBreakUseCase,
  IDeleteBreakUseCase,
  IFindBreakByIdUseCase,
  IFindBreaksByUserUseCase,
} from '@pikslots/domain';
import { CreateBreakUseCaseImpl } from './create.break.usecase.impl';
import { UpdateBreakUseCaseImpl } from './update.break.usecase.impl';
import { DeleteBreakUseCaseImpl } from './delete.break.usecase.impl';
import { FindBreakByIdUseCaseImpl } from './find.break.by.id.usecase.impl';
import { FindBreaksByUserUseCaseImpl } from './find.breaks.by.user.usecase.impl';

export const BREAK_USECASES: Provider[] = [
  { useClass: CreateBreakUseCaseImpl, provide: ICreateBreakUseCase },
  { useClass: UpdateBreakUseCaseImpl, provide: IUpdateBreakUseCase },
  { useClass: DeleteBreakUseCaseImpl, provide: IDeleteBreakUseCase },
  { useClass: FindBreakByIdUseCaseImpl, provide: IFindBreakByIdUseCase },
  { useClass: FindBreaksByUserUseCaseImpl, provide: IFindBreaksByUserUseCase },
];
