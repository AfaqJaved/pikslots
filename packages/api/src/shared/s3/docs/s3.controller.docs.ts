import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { GetPresignedUploadUrlDto } from '../dto/get.presigned.upload.url.dto';

export const GetPresignedUploadUrlDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a presigned URL to upload a file to S3' }),
    ApiBody({ type: GetPresignedUploadUrlDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Presigned upload URL generated successfully',
      schema: {
        example: {
          data: { url: 'https://s3.example.com/bucket/businesses/biz_01j/avatars/avatar.png?X-Amz-Signature=...' },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
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
