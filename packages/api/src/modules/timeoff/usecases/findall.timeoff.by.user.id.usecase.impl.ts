import { Inject } from '@nestjs/common';
import {
  err,
  FindAllTimeoffByUserCommand,
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
  message: 'Can not find timeoffs : unauthorized!!!',
  timestamp: new Date(),
};

export class FindAllTimeOffByUserUseCaseImpl implements FindAllTimeOffByUserUseCase {
  constructor(
    @Inject(ITimeoffRepository)
    private readonly timeoffrepository: TimeOffRepositoryImpl,
    private readonly securityContext: SecurityContext,
  ) {}
  async execute(
    command: FindAllTimeoffByUserCommand,
  ): Promise<Result<Timeoff[], UnauthorizedError | InfrastructureError>> {
    const callerRole = this.securityContext.role;
    const isSelf = this.securityContext.userId === command.userId;
    const isPartOfTheSameBusiness =
      this.securityContext.businessId === command.businessId;

    if (!Timeoff.canViewTimeoff(callerRole, isPartOfTheSameBusiness, isSelf))
      return err<UnauthorizedError>(UNAUTHORIZED_ERROR);

    const rows = await this.timeoffrepository.findAllByUser(
      command.userId,
      command.businessId,
    );

    if (!rows.ok) return err(rows.error);

    return ok(rows.value);
  }
}
