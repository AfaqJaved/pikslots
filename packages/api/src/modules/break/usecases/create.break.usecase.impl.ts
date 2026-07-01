import { Inject, Injectable } from '@nestjs/common';
import {
  Break,
  ok,
  IBreakRepository,
  err,
  type BreakOverlapError,
  type CreateBreakCommand,
  type InfrastructureError,
  type Result,
  type BreakRepository,
  CreateBreakUseCase,
} from '@pikslots/domain';
import { randomUUID } from 'crypto';

Injectable();
export class CreateBreakUseCaseImpl implements CreateBreakUseCase {
  constructor(
    @Inject(IBreakRepository) private readonly breakRepository: BreakRepository,
  ) {}
  async execute(
    command: CreateBreakCommand,
  ): Promise<Result<Break, BreakOverlapError | InfrastructureError>> {
    if (!command.userId || !command.buisnessId) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Missing user or business context for creating a break',
        timestamp: new Date(),
        cause: null,
      });
    }

    const existingResult = await this.breakRepository.findAllByUserId(
      command.userId,
    );
    if (!existingResult.ok) return err(existingResult.error);

    const candidate = Break.create({
      id: randomUUID(),
      userId: command.userId,
      buisnessId: command.buisnessId,
      day: command.day,
      startTime: command.startTime,
      endTime: command.endTime,
      createdBy: command.requestedBy,
    });

    const conflict = existingResult.value.find((b) =>
      candidate.overlapsWith(b),
    );
    if (conflict) {
      return err<BreakOverlapError>({
        kind: 'break_overlap',
        message: `Break overlaps with existing Break on ${command.day} (${conflict.startTime} -${conflict.endTime})`,
        day: command.day,
        conflictingStart: conflict.startTime,
        conflictingEnd: conflict.endTime,
        timestamp: new Date(),
      });
    }
    const saveResult = await this.breakRepository.save({
      id: candidate.id,
      userId: command.userId,
      buisnessId: command.buisnessId,
      day: command.day,
      startTime: command.startTime,
      endTime: command.endTime,
      createdBy: command.requestedBy,
    });
    if (!saveResult.ok) return err(saveResult.error);

    return ok(saveResult.value);
  }
}
