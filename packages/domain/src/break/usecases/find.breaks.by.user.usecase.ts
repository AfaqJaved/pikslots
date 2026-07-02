import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { Break } from '../break.entity';

export interface FindBreaksByUserCommand {
  userId: string;
  businessId: string;
}

export const IFindBreaksByUserUseCase = Symbol('IFindBreaksByUserUseCase');

export interface FindBreaksByUserUseCase {
  execute(
    command: FindBreaksByUserCommand,
  ): Promise<Result<Break[], UnauthorizedError | InfrastructureError>>;
}
