import { Inject, Injectable } from '@nestjs/common';
import {
  EditTImeOffByIdUseCase,
  EditTimeoffCommand,
  err,
  InfrastructureError,
  ITimeoffRepository,
  ok,
  Result,
  Timeoff,
  TimeOffNotFound,
  UnauthorizedError,
} from '@pikslots/domain';
import { TimeOffRepositoryImpl } from '../repository/timeoff.repository.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not edit customer : unauthorized!!!',
  timestamp: new Date(),
};

@Injectable()
export class EditTimeoffByIdUseCaseImpl implements EditTImeOffByIdUseCase {
  constructor(
    @Inject(ITimeoffRepository)
    private readonly timeoffRepositoryImpl: TimeOffRepositoryImpl,
    private readonly securityContext: SecurityContext,
  ) {}
  async execute(
    command: EditTimeoffCommand,
  ): Promise<
    Result<void, TimeOffNotFound | UnauthorizedError | InfrastructureError>
  > {
    const result = await this.timeoffRepositoryImpl.findById(command.id);

    if (!result.ok) return err(result.error);

    if (!result.value) {
      return err({
        kind: 'timeoff_not_found',
        message: `timeoff not found by id: ${command.id}`,
        timestamp: new Date(),
        by: 'id',
        value: command.id,
      });
    }

    const callerRole = this.securityContext.role;
    const isPartOfTheSameBusiness =
      this.securityContext.businessId == result.value.businessId;
    const isSelf = this.securityContext.userId == result.value.userId;

    if (!Timeoff.canUpdateTimeoff(callerRole, isPartOfTheSameBusiness, isSelf))
      return err(UNAUTHORIZED_ERROR);

    const updated = result.value.update({
      title: command.title,
      startDateTime: command.startDateTime,
      endDateTime: command.endDateTime,
      recurrence: command.recurrence,
      allDay: command.allDay,
      timeZone: command.timeZone,
      updatedBy: this.securityContext.userId,
      updatedAt: new Date(),
    });

    const saved = await this.timeoffRepositoryImpl.update(updated);

    if (!saved.ok) return err(saved.error);

    return ok(saved.value);
  }
}
