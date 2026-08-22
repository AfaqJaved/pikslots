import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { CompleteOnboardingDto } from '../dto/complete.onboarding.dto';

export const CompleteOnboardingDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Complete platform onboarding' }),
    ApiBody({ type: CompleteOnboardingDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Onboarding completed successfully',
      schema: {
        example: {
          data: { message: 'success' },
          statusCode: 201,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'A platform owner, business owner or business already exists',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const GetOnboardingStatusDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Check whether onboarding is complete' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Onboarding status returned successfully',
      schema: {
        example: {
          data: { isOnboardingComplete: false },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );
