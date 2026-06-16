import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { BookingNotFoundError } from '../errors';

export interface DeleteBookingCommand {
  id: string;
  deletedBy: string;
}

export const IDeleteBookingUseCase = Symbol('IDeleteBookingUseCase');

export interface DeleteBookingUseCase {
  execute(
    command: DeleteBookingCommand,
  ): Promise<Result<void, BookingNotFoundError | UnauthorizedError | InfrastructureError>>;
}
