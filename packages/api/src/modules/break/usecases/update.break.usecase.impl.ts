import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  IBreakRepository,
  type Break,
  type BreakRepository,
  type BreakNotFoundError,
  type BreakOverlapError,
  type BreakNotOwnedError,
  type UpdateBreakUseCase,
  type UpdateBreakCommand,
  type InfrastructureError,
  type Result,
} from '@pikslots/domain';

@Injectable()
export class UpdateBreakUseCaseImpl implements UpdateBreakUseCase {
  constructor(
    @Inject(IBreakRepository) private readonly breakRepository: BreakRepository,
  ) {}

  async execute(
    command: UpdateBreakCommand,
  ): Promise<
    Result<
      Break,
      | BreakNotFoundError
      | BreakOverlapError
      | BreakNotOwnedError
      | InfrastructureError
    >
  > {
    const findResult = await this.breakRepository.findById(command.breakId);
    if (!findResult.ok) return err(findResult.error);

    if (!findResult.value)
      return err<BreakNotFoundError>({
        kind: 'break_not_found',
        message: `Break not found by id: ${command.breakId}`,
        by: 'id',
        value: command.breakId,
        timestamp: new Date(),
      });

    const break_ = findResult.value;

    const isPrivileged =
      command.requesterRole === 'Platform Owner' ||
      command.requesterRole === 'Business Owner' ||
      command.requesterRole === 'Admin';

    if (!break_.isOwnedBy(command.requesterId) && !isPrivileged) {
      return err<BreakNotOwnedError>({
        kind: 'break_not_owned',
        message: `You do not have permission to update this break`,
        requesterId: command.requesterId,
        ownerId: break_.userId,
        timestamp: new Date(),
      });
    }

    const existingResult = await this.breakRepository.findAllByUserId(
      break_.userId,
    );
    if (!existingResult.ok) return err(existingResult.error);

    const updated = break_.updateTime({
      startTime: command.startTime,
      endTime: command.endTime,
      updatedBy: command.requesterId,
    });

    const conflict = existingResult.value
      .filter((b) => b.id !== break_.id)
      .find((b) => updated.overlapsWith(b));

    if (conflict) {
      return err<BreakOverlapError>({
        kind: 'break_overlap',
        message: `Break overlaps with existing break on ${break_.day} (${conflict.startTime}–${conflict.endTime})`,
        day: break_.day,
        conflictingStart: conflict.startTime,
        conflictingEnd: conflict.endTime,
        timestamp: new Date(),
      });
    }

    const updateResult = await this.breakRepository.update(updated);
    if (!updateResult.ok) return err(updateResult.error);

    return ok(updateResult.value);
  }
}
