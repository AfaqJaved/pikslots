import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { Break } from '../break.entity';
import type { BreakNotFoundError } from '../errors';

export interface FindBreakByIdCommand {
  id: string;
}

export const IFindBreakByIdUseCase = Symbol('IFindBreakByIdUseCase');

export interface FindBreakByIdUseCase {
  execute(
    command: FindBreakByIdCommand,
  ): Promise<Result<Break, BreakNotFoundError | UnauthorizedError | InfrastructureError>>;
}
