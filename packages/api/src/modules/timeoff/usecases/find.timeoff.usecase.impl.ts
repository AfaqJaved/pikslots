import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  FindTimeOffByIdUseCase,
  InfrastructureError,
  ITimeoffRepository,
  ok,
  Result,
  Timeoff,
  TimeOffNotFound,
} from '@pikslots/domain';
import { TimeOffRepositoryImpl } from '../repository/timeoff.repository.impl';

@Injectable()
export class FindTimeOffByIdUseCaseImpl implements FindTimeOffByIdUseCase {
  constructor(
    @Inject(ITimeoffRepository)
    private readonly timeoffRepositoryImpl: TimeOffRepositoryImpl,
  ) {}
  async execute(
    command: string,
  ): Promise<Result<Timeoff, TimeOffNotFound | InfrastructureError>> {
    const result = await this.timeoffRepositoryImpl.find(command);

    if (!result.ok) return err(result.error);
    return ok(result.value);
  }
}
