import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  GetOnBoardingStatusUseCase,
  IUserRepository,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import type { UserRepository } from '@pikslots/domain';

@Injectable()
export class GetOnboardingStatusUseCaseImpl implements GetOnBoardingStatusUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<
    Result<{ isOnboardingComplete: boolean }, InfrastructureError>
  > {
    const platformOwners =
      await this.userRepository.findAllByRole('Platform Owner');

    if (!platformOwners.ok) return err(platformOwners.error);

    return ok({ isOnboardingComplete: platformOwners.value.length > 0 });
  }
}
