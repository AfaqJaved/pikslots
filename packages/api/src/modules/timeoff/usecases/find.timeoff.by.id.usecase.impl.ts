import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  FindTimeOffByIdUseCase,
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
  message: 'Can not find timeoff : unauthorized!!!',
  timestamp: new Date(),
};

@Injectable()
export class FindTimeOffByIdUseCaseImpl implements FindTimeOffByIdUseCase {
  constructor(
    @Inject(ITimeoffRepository)
    private readonly timeoffRepositoryImpl: TimeOffRepositoryImpl,
    private readonly securityContext: SecurityContext,
  ) {}
  async execute(
    id: string,
  ): Promise<
    Result<Timeoff, TimeOffNotFound | UnauthorizedError | InfrastructureError>
  > {
    const found = await this.timeoffRepositoryImpl.findById(id);

    if (!found.ok) return err(found.error);

    if (!found.value) {
      return err<TimeOffNotFound>({
        kind: 'timeoff_not_found',
        message: 'failed to find timeoff',
        by: 'id',
        value: id,
        timestamp: new Date(),
      });
    }

    const callerRole = this.securityContext.role;
    const isSelf = this.securityContext.userId == found.value.userId;
    const isPartOfTheSameBusiness =
      this.securityContext.businessId == found.value.businessId;

    if (!Timeoff.canViewTimeoff(callerRole, isPartOfTheSameBusiness, isSelf))
      return err<UnauthorizedError>(UNAUTHORIZED_ERROR);

    return ok(found.value);
  }
}
