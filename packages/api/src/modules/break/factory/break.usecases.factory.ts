import { Inject, Injectable } from '@nestjs/common';
import {
  ICreateBreakUseCase,
  IUpdateBreakUseCase,
  IDeleteBreakUseCase,
  IFindBreakByIdUseCase,
  IFindBreaksByUserUseCase,
} from '@pikslots/domain';
import type {
  CreateBreakUseCase,
  UpdateBreakUseCase,
  DeleteBreakUseCase,
  FindBreakByIdUseCase,
  FindBreaksByUserUseCase,
} from '@pikslots/domain';

@Injectable()
export class BreakUseCasesFactory {
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
