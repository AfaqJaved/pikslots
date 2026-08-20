import { Provider } from '@nestjs/common';
import {
  GetOnBoardingStatusUseCase,
  ICompleteOnBoardingUseCase,
} from '@pikslots/domain';
import { CompleteOnboardingUseCaseImpl } from './complete.onboarding.usecase.impl';
import { GetOnboardingStatusUseCaseImpl } from './get.onboarding.status.usecase.impl';

export const ONBOARDING_USECASES: Provider[] = [
  {
    useClass: CompleteOnboardingUseCaseImpl,
    provide: ICompleteOnBoardingUseCase,
  },
  {
    useClass: GetOnboardingStatusUseCaseImpl,
    provide: GetOnBoardingStatusUseCase,
  },
];
