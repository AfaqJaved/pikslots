import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ONBOARDING_ENDPOINTS } from '@pikslots/shared';
import type { OnboardingStatusResponse } from '@pikslots/shared';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import { OnboardingUseCaseFactory } from './factory/onboarding.usecases.factory';
import { mapOnboardingError } from './errors/onboarding.errors.map';
import { CompleteOnboardingDocs } from './docs/onboarding.controller.docs';
import { CompleteOnboardingDto } from './dto/complete.onboarding.dto';

@ApiTags('Onboarding')
@Controller('')
export class OnboardingController {
  constructor(
    private readonly onboardingUseCaseFactory: OnboardingUseCaseFactory,
  ) {}

  @Post(ONBOARDING_ENDPOINTS.ONBOARDING_COMPLETE)
  @CompleteOnboardingDocs()
  async completeOnboarding(
    @Body() dto: CompleteOnboardingDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<{ message: 'success' }>
  > {
    const result =
      await this.onboardingUseCaseFactory.completeOnBoardingUseCase.execute(
        dto,
      );

    if (!result.ok) {
      const errorResponse = mapOnboardingError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse(result.value, HttpStatus.CREATED);
  }

  @Get(ONBOARDING_ENDPOINTS.ONBOARDING_STATUS)
  async getOnboardingStatus(
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<OnboardingStatusResponse>
  > {
    const result =
      await this.onboardingUseCaseFactory.getOnBoardingStatusUseCase.execute();

    if (!result.ok) {
      const errorResponse = mapOnboardingError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(result.value, HttpStatus.OK);
  }
}
