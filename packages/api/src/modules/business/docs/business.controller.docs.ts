import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { RegisterBusinessDto } from '../dto/register.business.dto';

export const RegisterBusinessDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new business' }),
    ApiBody({ type: RegisterBusinessDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Business registered successfully',
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
      description: 'A business with this slug or email already exists',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
  );
