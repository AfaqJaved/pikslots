import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { Timeoff } from '../timeoff.entity';
import type { CreateTimeoffCommand } from '../types';

export const IRegisterTImeOffUseCase = Symbol('IRegisterTimeoffUseCase');

export interface RegisterTimeOffUseCase {
  execute(
    command: CreateTimeoffCommand,
  ): Promise<Result<Timeoff, UnauthorizedError | InfrastructureError>>;
}
