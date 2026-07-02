import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { TimeOffNotFound } from '../errors';
import type { Timeoff } from '../timeoff.entity';

export const IFindAllTime0ffByUserUseCase = Symbol('IFindAllTimeoffByUserUseCase');

export interface FindAllTimeOffByUserUseCase {
  execute(
    command: string,
  ): Promise<Result<Timeoff[], TimeOffNotFound | UnauthorizedError | InfrastructureError>>;
}
