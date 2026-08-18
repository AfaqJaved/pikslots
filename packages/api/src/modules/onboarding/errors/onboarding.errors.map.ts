import { HttpStatus } from '@nestjs/common';
import {
  type businessOwnerAlreadyExist,
  type BusinessAlreadyExistsError,
  type InfrastructureError,
  type PlatformOwnerAlreadyExist,
  type UserAlreadyExistsError,
} from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

type OnboardingError =
  | PlatformOwnerAlreadyExist
  | businessOwnerAlreadyExist
  | BusinessAlreadyExistsError
  | UserAlreadyExistsError
  | InfrastructureError;

const onboardingErrorMap: Record<
  OnboardingError['kind'],
  (error: OnboardingError) => PikslotsBaseErrorResponse
> = {
  platform_owner_already_exist: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  business_owner_already_exist: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  business_already_exists: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  user_already_exists: (error) =>
    new PikslotsBaseErrorResponse(error.message, HttpStatus.CONFLICT),
  infrastructure: () =>
    new PikslotsBaseErrorResponse(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),
};

export function mapOnboardingError(
  error: OnboardingError,
): PikslotsBaseErrorResponse {
  return onboardingErrorMap[error.kind](error);
}
