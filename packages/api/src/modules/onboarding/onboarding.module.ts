import { Module } from '@nestjs/common';
import { IOnboardingRepository } from '@pikslots/domain';
import { OnboardingRepositoryImpl } from './repository/onboarding.repository.impl';
import { ONBOARDING_USECASES } from './usecase';
import { OnboardingUseCaseFactory } from './factory/onboarding.usecases.factory';
import { OnboardingController } from './onboarding.controller';
import { UserModule } from '../user/user.module';
import { BusinessModule } from '../business/business.module';

@Module({
  imports: [UserModule, BusinessModule],
  controllers: [OnboardingController],
  providers: [
    { useClass: OnboardingRepositoryImpl, provide: IOnboardingRepository },
    ...ONBOARDING_USECASES,
    OnboardingUseCaseFactory,
  ],
})
export class OnboardingModule {}
