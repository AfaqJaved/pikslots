import { Inject, Injectable } from '@nestjs/common';
import {
  IDeleteTimeoffUseCase,
  IEditTimeOffByIdUseCase,
  IFindAllTime0ffByUserUseCase,
  IFindTime0ffByIdUseCase,
  ISaveTImeOffUseCase,
} from '@pikslots/domain';
import type {
  SaveTimeOffUseCase,
  DeleteTimeoffUseCase,
  EditTImeOffByIdUseCase,
  FindAllTimeOffByUserUseCase,
  FindTimeOffByIdUseCase,
} from '@pikslots/domain';

@Injectable()
export class TimeoffUsecasesFactory {
  @Inject(ISaveTImeOffUseCase)
  public readonly saveTimeoffUsecase: SaveTimeOffUseCase;
  @Inject(IEditTimeOffByIdUseCase)
  public readonly editTimeoffUsecase: EditTImeOffByIdUseCase;
  @Inject(IFindAllTime0ffByUserUseCase)
  public readonly findAllTimeoffUsecase: FindAllTimeOffByUserUseCase;
  @Inject(IFindTime0ffByIdUseCase)
  public readonly findTImeoffUsecase: FindTimeOffByIdUseCase;
  @Inject(IDeleteTimeoffUseCase)
  public readonly deleteTimeoffUsecase: DeleteTimeoffUseCase;
}
