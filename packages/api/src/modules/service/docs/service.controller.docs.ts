import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { RegisterServiceDto } from '../dto/register.service.dto';

export const RegisterServiceDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new service for the authenticated business' }),
    ApiBody({ type: RegisterServiceDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Service registered successfully',
      schema: {
        example: {
          data: { id: 'svc_01j...', title: 'Haircut' },
          statusCode: 201,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'A service with this title already exists for this business',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );
