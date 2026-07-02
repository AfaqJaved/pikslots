import { HttpStatus } from '@nestjs/common';
import type {
  BreakConflictError,
  BreakNotFoundError,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type BreakError =
  | BreakNotFoundError
  | BreakConflictError
  | UnauthorizedError
  | InfrastructureError;

const breakErrorMap: Record<
  BreakError['kind'],
  (error: BreakError) => PikslotsBaseErrorResponse
> = {
  break_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  break_conflict: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  unauthorized: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.UNAUTHORIZED),
  infrastructure: () =>
    new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapBreakError(error: BreakError): PikslotsBaseErrorResponse {
  console.log(error);
  return breakErrorMap[error.kind](error);
}
