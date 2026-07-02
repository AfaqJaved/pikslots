import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { TimeOffNotFound } from '../errors';
import type { Timeoff } from '../timeoff.entity';

export const IFindTime0ffByIdUseCase = Symbol('IFindTimeoffByIdUseCase');

export interface FindTimeOffByIdUseCase {
  execute(
    command: string,
  ): Promise<Result<Timeoff, TimeOffNotFound | UnauthorizedError | InfrastructureError>>;
}
