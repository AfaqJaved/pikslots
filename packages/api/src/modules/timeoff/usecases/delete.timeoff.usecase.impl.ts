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
  message: 'Can not delete timeoff : unauthorized!!!',
  timestamp: new Date(),
};
export class DeleteTimeoffUseCaseImpl implements DeleteTimeoffUseCase {
  constructor(
    @Inject(ITimeoffRepository)
    private readonly timeoffRepository: TimeOffRepositoryImpl,
    private readonly securityContext: SecurityContext,
  ) {}
  async execute(
    id: string,
  ): Promise<
    Result<void, TimeOffNotFound | UnauthorizedError | InfrastructureError>
  > {
    const found = await this.timeoffRepository.find(id);
    if (!found.ok) return err(found.error);
    if (!found.value) {
      return err({
        kind: 'timeoff_not_found',
        message: `timeoff not found by id: ${id}`,
        timestamp: new Date(),
        by: 'id',
        value: id,
      });
    }

    const callerRole = this.securityContext.role;
    const isSelf = this.securityContext.userId == found.value.userId;
    const isPartOfSameBusiness =
      this.securityContext.businessId == found.value.businessId;

    if (!Timeoff.canDeleteTimeoff(callerRole, isPartOfSameBusiness, isSelf))
      return err(UNAUTHORIZED_ERROR);

    const deleteTimeoff = await this.timeoffRepository.delete(found.value.id);

    if (!deleteTimeoff.ok) return err(deleteTimeoff.error);

    return ok(deleteTimeoff.value);
  }
}
