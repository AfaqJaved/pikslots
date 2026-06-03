import { HttpStatus } from '@nestjs/common';
import {
  err,
  type BusinessAlreadyExistsError,
  type BusinessInactiveError,
  type BusinessNotFoundError,
  type BusinessSuspendedError,
  type InfrastructureError,
  type UnauthorizedError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type BusinessError =
  | BusinessAlreadyExistsError
  | BusinessNotFoundError
  | BusinessSuspendedError
  | BusinessInactiveError
  | UnauthorizedError
  | InfrastructureError;

const businessErrorMap: Record<
  BusinessError['kind'],
  (error: BusinessError) => PikslotsBaseErrorResponse
> = {
  business_already_exists: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  business_not_found: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  business_suspended: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.FORBIDDEN),
  business_inactive: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.FORBIDDEN),
  unauthorized: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.UNAUTHORIZED),
  infrastructure: (error) => {
    //@ts-ignore
    console.log(error.cause);
    return new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  },
};

export function mapBusinessError(
  error: BusinessError,
): PikslotsBaseErrorResponse {
  return businessErrorMap[error.kind](error);
}
