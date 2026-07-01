import { Inject, Injectable } from '@nestjs/common';
import {
  Break,
  err,
  IBreakRepository,
  ok,
  type BreakNotFoundError,
  type BreakRepository,
  type InfrastructureError,
  type Result,
  type FindBreakByIdUseCase,
} from '@pikslots/domain';
@Injectable()
export class FindBreakbyIdUsecaseImpl implements FindBreakByIdUseCase {
  constructor(
    @Inject(IBreakRepository) private readonly breakRepository: BreakRepository,
  ) {}

  async execute(
    breakId: string,
  ): Promise<Result<Break, BreakNotFoundError | InfrastructureError>> {
    const result = await this.breakRepository.findById(breakId);
    if (!result.ok) return err(result.error);

    if (!result.value)
      return err<BreakNotFoundError>({
        kind: 'break_not_found',
        message: `break not found by id: ${breakId}`,
        by: 'id',
        value: breakId,
        timestamp: new Date(),
      });
    return ok(result.value);
  }
}
