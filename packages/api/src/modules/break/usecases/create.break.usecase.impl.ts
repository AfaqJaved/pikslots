import { Inject, Injectable } from '@nestjs/common';
import {
  Break,
  BreakConflictError,
  type BreakRepository,
  CreateBreakCommand,
  CreateBreakUseCase,
  err,
  IBreakRepository,
  InfrastructureError,
  ok,
  Result,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { v7 as uuidv7 } from 'uuid';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Cannot create break: unauthorized',
  timestamp: new Date(),
};

@Injectable()
export class CreateBreakUseCaseImpl implements CreateBreakUseCase {
  constructor(
    @Inject(IBreakRepository)
    private readonly breakRepository: BreakRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: CreateBreakCommand,
  ): Promise<
    Result<Break, BreakConflictError | UnauthorizedError | InfrastructureError>
  > {
    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const callerUserId = this.securityContext.userId;
    const isSelf = callerUserId === command.userId;
    const isPartOfSameBusiness = callerBusinessId === command.businessId;

    if (!Break.canCreateBreak(callerRole, isSelf, isPartOfSameBusiness)) {
      return err(UNAUTHORIZED_ERROR);
    }

    const conflict = await this.breakRepository.hasConflict(
      command.userId,
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

    const breakEntity = Break.create({
      id: uuidv7(),
      day: command.day,
      startTime: command.startTime,
      endTime: command.endTime,
      userId: command.userId,
      businessId: command.businessId,
      createdBy: command.createdBy,
    });

    const saved = await this.breakRepository.save(breakEntity);

    if (!saved.ok) return err(saved.error);

    return ok(breakEntity);
  }
}
