import { Inject, Injectable } from '@nestjs/common';
import {
  Break,
  ok,
  err,
  type BreakRepository,
  IBreakRepository,
  type InfrastructureError,
  type Result,
  FindBreaksByUserUseCase,
} from '@pikslots/domain';

@Injectable()
export class FindBreaksByUserUseCaseImpl implements FindBreaksByUserUseCase {
  constructor(
    @Inject(IBreakRepository) private readonly breakRepository: BreakRepository,
  ) {}

  async execute(UserId: string): Promise<Result<Break[], InfrastructureError>> {
    const result = await this.breakRepository.findAllByUserId(UserId);
    if (!result.ok) return err(result.error);
    return ok(result.value);
  }
}
