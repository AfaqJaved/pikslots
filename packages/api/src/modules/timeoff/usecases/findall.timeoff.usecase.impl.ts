import { Inject } from '@nestjs/common';
import {
  err,
  FindAllTimeOffByUserUseCase,
  InfrastructureError,
  ITimeoffRepository,
  ok,
  Result,
  Timeoff,
} from '@pikslots/domain';
import { TimeOffRepositoryImpl } from '../repository/timeoff.repository.impl';

export class FindAllTimeOffByUserUseCaseImpl implements FindAllTimeOffByUserUseCase {
  constructor(
    @Inject(ITimeoffRepository)
    private readonly timeoffrepository: TimeOffRepositoryImpl,
  ) {}
  async execute(
    command: string,
  ): Promise<Result<Timeoff[] | null, InfrastructureError>> {
    const rows = await this.timeoffrepository.findAll(command);
    if (!rows.ok) return err(rows.error);
    return ok(rows.value);
  }
}
