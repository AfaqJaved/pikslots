import type { InfrastructureError, Result } from '../../shared';

export const GetOnBoardingStatusUseCase = Symbol('GetOnBoardingStatusUseCase');

export interface GetOnBoardingStatusUseCase {
  execute(): Promise<Result<{ isOnboardingComplete: boolean }, InfrastructureError>>;
}
