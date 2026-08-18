import {
  err,
  InfrastructureError,
  ok,
  Onboarding,
  OnboardingRepository,
  Result,
  UserAlreadyExistsError,
} from '@pikslots/domain';
import { ONBOARDING_TEST_DATA } from './onboarding.test.data';

export class OnboardingRepositoryTestImpl implements OnboardingRepository {
  async registerOnboarding(
    onboarding: Onboarding,
  ): Promise<Result<void, UserAlreadyExistsError | InfrastructureError>> {
    try {
      await Promise.resolve('');

      ONBOARDING_TEST_DATA.push(onboarding);
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save user',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
