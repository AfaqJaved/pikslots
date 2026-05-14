import { HttpStatus } from '@nestjs/common';
import type {
  InfrastructureError,
  UnauthorizedError,
  UserAlreadyExistsError,
  UserNotFoundError,
  UserSuspendedError,
  UserInactiveError,
  ValidationError,
} from '@pikslots/domain';
import { BaseErrorResponse } from 'src/shared/types/base.error.response';

type UserError =
  | UserAlreadyExistsError
  | UnauthorizedError
  | UserNotFoundError
  | UserInactiveError
  | UserSuspendedError
  | InfrastructureError
  | ValidationError;

const userErrorMap: Record<
  UserError['kind'],
  (error: UserError) => BaseErrorResponse
> = {
  user_already_exists: (error) =>
    new BaseErrorResponse(error.message, HttpStatus.CONFLICT),
  user_not_found: (error) =>
    new BaseErrorResponse(error.message, HttpStatus.NOT_FOUND),
  user_suspended: (error) =>
    new BaseErrorResponse(error.message, HttpStatus.FORBIDDEN),
  user_inactive: (error) =>
    new BaseErrorResponse(error.message, HttpStatus.FORBIDDEN),
  unauthorized: (error) =>
    new BaseErrorResponse(error.message, HttpStatus.UNAUTHORIZED),
  validation: (error) =>
    new BaseErrorResponse(error.message, HttpStatus.BAD_REQUEST),
  infrastructure: () =>
    new BaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapUserError(error: UserError): BaseErrorResponse {
  return userErrorMap[error.kind](error);
}
