import { Inject, Injectable } from '@nestjs/common';
import {
  Break,
  BreakConflictError,
  BreakNotFoundError,
  type BreakRepository,
  UpdateBreakCommand,
  UpdateBreakUseCase,
  err,
  IBreakRepository,
  InfrastructureError,
  ok,
  Result,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Cannot update break: unauthorized',
  timestamp: new Date(),
};

@Injectable()
export class UpdateBreakUseCaseImpl implements UpdateBreakUseCase {
  constructor(
    @Inject(IBreakRepository)
    private readonly breakRepository: BreakRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: UpdateBreakCommand,
  ): Promise<
    Result<
      Break,
      | BreakNotFoundError
      | BreakConflictError
      | UnauthorizedError
      | InfrastructureError
    >
  > {
    const found = await this.breakRepository.findById(command.id);
    if (!found.ok) return err(found.error);

    if (!found.value) {
      return err<BreakNotFoundError>({
        kind: 'break_not_found',
        by: 'id',
        value: command.id,
        message: `Break not found by id: ${command.id}`,
        timestamp: new Date(),
      });
    }

    const callerRole = this.securityContext.role;
    const isSelf = this.securityContext.userId === found.value.userId;
    const isPartOfSameBusiness =
      this.securityContext.businessId === found.value.businessId;

    if (!Break.canUpdateBreak(callerRole, isSelf, isPartOfSameBusiness)) {
      return err(UNAUTHORIZED_ERROR);
    }

    const conflict = await this.breakRepository.hasConflict(
      found.value.userId,
      command.day,
      command.startTime,
      command.endTime,
    );

    if (!conflict.ok) return err(conflict.error);

    if (conflict.value) {
      return err<BreakConflictError>({
        kind: 'break_conflict',
        day: command.day,
        startTime: command.startTime,
        endTime: command.endTime,
        message: 'A break already exists for this time slot',
        timestamp: new Date(),
      });
    }

    const updated = found.value.update({
      day: command.day,
      startTime: command.startTime,
      endTime: command.endTime,
      updatedBy: command.updatedBy,
    });

    const saved = await this.breakRepository.update(updated);

    if (!saved.ok) return err(saved.error);

    return ok(updated);
  }
}
