import { Inject } from '@nestjs/common';
import {
  DeleteTimeoffUseCase,
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
export class DeleteTimeoffUseCaseImpl implements DeleteTimeoffUseCase {
  constructor(
    @Inject(ITimeoffRepository)
    private readonly timeoffRepository: TimeOffRepositoryImpl,
    private readonly securityContext: SecurityContext,
  ) {}
  async execute(
    command: string,
  ): Promise<
    Result<void, TimeOffNotFound | UnauthorizedError | InfrastructureError>
  > {
    const found = await this.timeoffRepository.find(command);
    if (!found.ok) return err(found.error);
    if (!found.value) {
      return err({
        kind: 'timeoff_not_found',
        message: `timeoff not found by id: ${command}`,
        timestamp: new Date(),
        by: 'id',
        value: command,
      });
    }

    const callerRole = this.securityContext.role;
    const isSelf = this.securityContext.userId == found.value.userId;
    const isPartOfSameBusiness =
      this.securityContext.businessId == found.value.businessId;

    if (!Timeoff.canDeletTimeoff(callerRole, isPartOfSameBusiness, isSelf))
      return err(UNAUTHORIZED_ERROR);

    const delet = await this.timeoffRepository.delete(found.value.id);

    if (!delet.ok) return err(delet.error);

    return ok(delet.value);
  }
}
