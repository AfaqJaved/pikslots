import { Inject, Injectable } from '@nestjs/common';
import {
  GetOnBoardingStatusUseCase,
  ICompleteOnBoardingUseCase,
} from '@pikslots/domain';
import type { CompleteOnBoardingUseCase } from '@pikslots/domain';

@Injectable()
export class OnboardingUseCaseFactory {
  @Inject(ICompleteOnBoardingUseCase)
  public readonly completeOnBoardingUseCase: CompleteOnBoardingUseCase;

  @Inject(GetOnBoardingStatusUseCase)
  public readonly getOnBoardingStatusUseCase: GetOnBoardingStatusUseCase;
}
