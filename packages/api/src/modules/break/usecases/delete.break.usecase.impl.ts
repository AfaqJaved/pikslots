import { Inject, Injectable } from '@nestjs/common';
import {
  IBreakRepository,
  err,
  ok,
  type Result,
  type BreakRepository,
  type DeleteBreakCommand,
  type BreakNotFoundError,
  type BreakNotOwnedError,
  type InfrastructureError,
  type DeleteBreakUseCase,
} from '@pikslots/domain';

@Injectable()
export class DeleteBreakUseCaseImpl implements DeleteBreakUseCase {
  constructor(
    @Inject(IBreakRepository) private readonly breakRepository: BreakRepository,
  ) {}
  async execute(
    command: DeleteBreakCommand,
  ): Promise<
    Result<void, BreakNotFoundError | BreakNotOwnedError | InfrastructureError>
  > {
    const findResult = await this.breakRepository.findById(command.breakId);

    if (!findResult.ok) {
      return err(findResult.error);
    }

    if (!findResult.value) {
      return err({
        kind: 'break_not_found',
        message: `Break not found by id: ${command.breakId}`,
        by: 'id',
        value: command.breakId,
        timestamp: new Date(),
      });
    }

    const break_ = findResult.value;

    const isPrivileged =
      command.requesterRole === 'Platform Owner' ||
      command.requesterRole === 'Business Owner' ||
      command.requesterRole === 'Admin';

    if (!break_.isOwnedBy(command.deletedBy) && !isPrivileged) {
      return err({
        kind: 'break_not_owned',
        message: 'You do not have permission to delete this break',
        requesterId: command.deletedBy,
        ownerId: break_.userId,
        timestamp: new Date(),
      });
    }

    const deleteResult = await this.breakRepository.delete(command.breakId);

    if (!deleteResult.ok) {
      return err(deleteResult.error);
    }

    return ok(undefined);
  }
}
