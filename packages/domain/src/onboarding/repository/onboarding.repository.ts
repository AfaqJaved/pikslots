import type { BusinessAlreadyExistsError } from '../../business';
import type { InfrastructureError, Result } from '../../shared';
import type { UserAlreadyExistsError } from '../../user';
import type { businessOwnerAlreadyExist, PlatformOwnerAlreadyExist } from '../errors';
import type { Onboarding } from '../onboarding.entity';

export interface OnboardingRepository {
  registerOnboarding(
    onboarding: Onboarding,
  ): Promise<Result<void, UserAlreadyExistsError | InfrastructureError>>;
}

export const IOnboardingRepository = Symbol('IOnboardingRepository');
