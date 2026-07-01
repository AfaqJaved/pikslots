import { Inject, Injectable } from '@nestjs/common';
import {
  Break,
  BreakProps,
  type BreakRepository,
  err,
  FindBreaksByUserCommand,
  FindBreaksByUserUseCase,
  IBreakRepository,
  InfrastructureError,
  ok,
  Result,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Access denied',
  timestamp: new Date(),
};

@Injectable()
export class FindBreaksByUserUseCaseImpl implements FindBreaksByUserUseCase {
  constructor(
    @Inject(IBreakRepository)
    private readonly breakRepository: BreakRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: FindBreaksByUserCommand,
  ): Promise<Result<Break[], UnauthorizedError | InfrastructureError>> {
    const callerRole = this.securityContext.role;
    const isSelf = this.securityContext.userId === command.userId;
    const isPartOfSameBusiness =
      this.securityContext.businessId === command.businessId;

    if (!Break.canViewBreaks(callerRole, isSelf, isPartOfSameBusiness)) {
      return err(UNAUTHORIZED_ERROR);
    }

    const result = await this.breakRepository.findAllByUser(command.userId);
    if (!result.ok) return err(result.error);

    return ok(result.value);
  }
}
