import { Inject, Injectable } from '@nestjs/common';
import {
  ClassNotFoundError,
  DeleteClassUseCase,
  err,
  IClassRepository,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import type { ClassRepository } from '@pikslots/domain';

@Injectable()
export class DeleteClassUseCaseImpl implements DeleteClassUseCase {
  constructor(
    @Inject(IClassRepository)
    private readonly classRepository: ClassRepository,
  ) {}

  async execute(
    id: string,
  ): Promise<Result<void, ClassNotFoundError | InfrastructureError>> {
    const result = await this.classRepository.delete(id);

    if (!result.ok) return err(result.error);

    return ok(result.value);
  }
}
