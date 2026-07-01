import { HttpStatus } from '@nestjs/common';
import type {
  BreakNotFoundError,
  BreakOverlapError,
  BreakNotOwnedError,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

export type BreakError =
  | BreakNotFoundError
  | BreakOverlapError
  | BreakNotOwnedError
  | UnauthorizedError
  | InfrastructureError;

const breakErrorMap: {
  [K in BreakError['kind']]: (error: BreakError) => PikslotsBaseErrorResponse;
} = {
  break_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),

  break_overlap: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),

  break_not_owned: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.FORBIDDEN),

  unauthorized: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.FORBIDDEN),

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
