import { Inject, Injectable } from '@nestjs/common';
import {
  Break,
  BreakNotFoundError,
  type BreakRepository,
  err,
  FindBreakByIdCommand,
  FindBreakByIdUseCase,
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
export class FindBreakByIdUseCaseImpl implements FindBreakByIdUseCase {
  constructor(
    @Inject(IBreakRepository)
    private readonly breakRepository: BreakRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: FindBreakByIdCommand,
  ): Promise<
    Result<Break, BreakNotFoundError | UnauthorizedError | InfrastructureError>
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

    if (!Break.canViewBreaks(callerRole, isSelf, isPartOfSameBusiness)) {
      return err(UNAUTHORIZED_ERROR);
    }

    return ok(found.value);
  }
}
