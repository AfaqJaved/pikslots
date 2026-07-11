import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { Timeoff } from '../timeoff.entity';

export interface FindAllTimeoffByUserCommand {
  userId: string;
  businessId: string;
}

export const IFindAllTime0ffByUserUseCase = Symbol('IFindAllTimeoffByUserUseCase');

export interface FindAllTimeOffByUserUseCase {
  execute(
    command: FindAllTimeoffByUserCommand,
  ): Promise<Result<Timeoff[], UnauthorizedError | InfrastructureError>>;
}
