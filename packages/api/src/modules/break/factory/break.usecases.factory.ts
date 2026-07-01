import { Inject, Injectable } from '@nestjs/common';
import type {
  CreateBreakUseCase,
  DeleteBreakUseCase,
  FindBreakByIdUseCase,
  FindBreaksByUserUseCase,
  UpdateBreakUseCase,
} from '@pikslots/domain';
import {
  ICreateBreakUseCase,
  IDeleteBreakUseCase,
  IFindBreakByIdUseCase,
  IFindBreaksByUserUseCase,
  IUpdateBreakUseCase,
} from '@pikslots/domain';

@Injectable()
export class BreakUsecasesFactory {
  @Inject(ICreateBreakUseCase)
  public readonly createBreakUseCase: CreateBreakUseCase;

  @Inject(IUpdateBreakUseCase)
  public readonly updateBreakUseCase: UpdateBreakUseCase;

  @Inject(IDeleteBreakUseCase)
  public readonly deleteBreakUseCase: DeleteBreakUseCase;

  @Inject(IFindBreakByIdUseCase)
  public readonly findBreakByIdUseCase: FindBreakByIdUseCase;

  @Inject(IFindBreaksByUserUseCase)
  public readonly findBreaksByUserUseCase: FindBreaksByUserUseCase;
}
