import { HttpStatus } from '@nestjs/common';
import {
  InfrastructureError,
  TimeOffNotFound,
  UnauthorizedError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type TimeoffError = TimeOffNotFound | UnauthorizedError | InfrastructureError;

const timeoffErrorMap: Record<
  TimeoffError['kind'],
  (error: TimeoffError) => PikslotsBaseErrorResponse
> = {
  timeoff_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  unauthorized: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.UNAUTHORIZED),
  infrastructure: () =>
    new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapTimeoffError(
  error: TimeoffError,
): PikslotsBaseErrorResponse {
  console.log(error);
  return timeoffErrorMap[error.kind](error);
}
