import type { Result, InfrastructureError, UnauthorizedError } from '../../shared';
import type { BreakNotFoundError } from '../errors/index';
import type { Break } from '../break.entity';

export const IFindBreakByIdUseCase = Symbol('IFindBreakByIdUseCase');

export interface FindBreakByIdUseCase {
  execute(
    breakId: string,
  ): Promise<Result<Break, BreakNotFoundError | UnauthorizedError | InfrastructureError>>;
}
