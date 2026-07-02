import { Inject } from '@nestjs/common';
import {
  err,
  FindAllTimeOffByUserUseCase,
  InfrastructureError,
  ITimeoffRepository,
  ok,
  Result,
  Timeoff,
  UnauthorizedError,
} from '@pikslots/domain';
import { TimeOffRepositoryImpl } from '../repository/timeoff.repository.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Can not edit customer : unauthorized!!!',
  timestamp: new Date(),
};

export class FindAllTimeOffByUserUseCaseImpl implements FindAllTimeOffByUserUseCase {
  constructor(
    @Inject(ITimeoffRepository)
    private readonly timeoffrepository: TimeOffRepositoryImpl,
    private readonly securityContext: SecurityContext,
  ) {}
  async execute(
    command: string,
  ): Promise<Result<Timeoff[], UnauthorizedError | InfrastructureError>> {
    const rows = await this.timeoffrepository.findAll(command);

    if (!rows.ok) return err(rows.error);
    if (!rows.value) return ok([]);

    const callerRole = this.securityContext.role;
    const isSelf = this.securityContext.userId == rows.value[0].userId;
    const isPartOfTheSameBusiness =
      this.securityContext.businessId == rows.value[0].businessId;

    if (!Timeoff.canViewTimeoff(callerRole, isPartOfTheSameBusiness, isSelf))
      return err<UnauthorizedError>(UNAUTHORIZED_ERROR);

    return ok(rows.value);
  }
}
