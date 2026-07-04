import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { Timeoff } from '../timeoff.entity';

export interface CreateTimeoffCommand {
  title: string;
  userId: string;
  businessId: string;
  startDateTime: string;
  endDateTime: string;
  recurrence: string | null;
}

export const IRegisterTImeOffUseCase = Symbol('IRegisterTimeoffUseCase');

export interface RegisterTimeOffUseCase {
  execute(
    command: CreateTimeoffCommand,
  ): Promise<Result<Timeoff, UnauthorizedError | InfrastructureError>>;
}
