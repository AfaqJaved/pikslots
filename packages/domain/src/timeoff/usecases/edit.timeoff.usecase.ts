import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { TimeOffNotFound } from '../errors';

export interface EditTimeoffCommand {
  id: string;
  title: string;
  userId: string;
  businessId: string;
  startDateTime: string;
  endDateTime: string;
  timeZone: string;
  allDay: boolean;
  recurrence: string | null;
}

export const IEditTimeOffByIdUseCase = Symbol('IEditTimeOffByIdUseCase');

export interface EditTImeOffByIdUseCase {
  execute(
    command: EditTimeoffCommand,
  ): Promise<Result<void, TimeOffNotFound | UnauthorizedError | InfrastructureError>>;
}
