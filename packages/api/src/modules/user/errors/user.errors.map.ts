import { HttpStatus } from '@nestjs/common';
import type {
  InfrastructureError,
  UnauthorizedError,
  UserAlreadyExistsError,
} from '@pikslots/domain';
import { BaseErrorResponse } from 'src/shared/types/base.error.response';

type UserError =
  | UserAlreadyExistsError
  | UnauthorizedError
  | InfrastructureError;

const userErrorMap: Record<
  UserError['kind'],
  (error: UserError) => BaseErrorResponse
> = {
  user_already_exists: (error) =>
    new BaseErrorResponse(error.message, HttpStatus.CONFLICT),
  unauthorized: () =>
    new BaseErrorResponse('Access denied', HttpStatus.UNAUTHORIZED),
  infrastructure: () =>
    new BaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapUserError(error: UserError): BaseErrorResponse {
  return userErrorMap[error.kind](error);
}
