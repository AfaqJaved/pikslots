import { Inject } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  ITimeoffRepository,
  ok,
  Result,
  RegisterTimeOffUseCase,
  Timeoff,
  UnauthorizedError,
  CreateTimeoffCommand,
} from '@pikslots/domain';
import { TimeOffRepositoryImpl } from '../repository/timeoff.repository.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { v7 as uuidv7 } from 'uuid';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not create timeoff : unauthorized!!!',
  timestamp: new Date(),
};
export class RegisterTimeOffUseCaseImpl implements RegisterTimeOffUseCase {
  constructor(
    @Inject(ITimeoffRepository)
    private readonly timeoffRepository: TimeOffRepositoryImpl,
    private readonly securityContext: SecurityContext,
  ) {}
  async execute(
    command: CreateTimeoffCommand,
  ): Promise<Result<Timeoff, UnauthorizedError | InfrastructureError>> {
    const callerRole = this.securityContext.role;
    const isSelf = this.securityContext.userId === command.userId;
    const isPartOfTheSameBusiness =
      this.securityContext.businessId === command.businessId;

    if (!Timeoff.canCreateTimeoff(callerRole, isPartOfTheSameBusiness, isSelf))
      return err(UNAUTHORIZED_ERROR);

    const timeoff = Timeoff.create({
      id: uuidv7(),
      title: command.title,
      userId: command.userId,
      businessId: command.businessId,
      startDateTime: command.startDateTime,
      endDateTime: command.endDateTime,
      timeZone: command.timeZone,
      allDay: command.allDay,
      recurrence: command.recurrence,
      createdBy: command.userId,
      updatedBy: command.userId,
    });

    const saved = await this.timeoffRepository.save(timeoff);

    if (!saved.ok) return err(saved.error);

    return ok(timeoff);
  }
}
