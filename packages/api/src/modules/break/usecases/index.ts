import { Provider } from '@nestjs/common';
import {
  ICreateBreakUseCase,
  IDeleteBreakUseCase,
  IFindBreakByIdUseCase,
  IUpdateBreakUseCase,
} from '@pikslots/domain';
import { CreateBreakUseCaseImpl } from './create.break.usecase.impl';
import { FindBreakbyIdUsecaseImpl } from './find.break.by.id.usecase.impl';
import { UpdateBreakUseCaseImpl } from './update.break.usecase.impl';
import { DeleteBreakUseCaseImpl } from './delete.break.usecase.impl';
import { FindBreaksByUserUseCaseImpl } from './find.breaks.by.user.usecase.imp';

export const BREAK_USECASE: Provider[] = [
  { useClass: CreateBreakUseCaseImpl, provide: ICreateBreakUseCase },
  { useClass: FindBreakbyIdUsecaseImpl, provide: IFindBreakByIdUseCase },
  { useClass: UpdateBreakUseCaseImpl, provide: IUpdateBreakUseCase },
  { useClass: DeleteBreakUseCaseImpl, provide: IDeleteBreakUseCase },
  { useClass: FindBreaksByUserUseCaseImpl, provide: IUpdateBreakUseCase },
];
