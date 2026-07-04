import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { RegisterTimeoffDto } from '../dto/register.timeoff.dto';
import { EditTimeoffDto } from '../dto/edit.timeoff.dto';

export const SaveTimeoffDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new time-off entry' }),
    ApiBody({ type: RegisterTimeoffDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Time-off created successfully',
      schema: {
        example: {
          data: { message: 'success' },
          statusCode: 201,
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
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to create time-off',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const FindTimeoffByIdDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a time-off entry by ID' }),
    ApiParam({
      name: 'findById',
      description: 'Time-off ID',
      example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Time-off retrieved successfully',
      schema: {
        example: {
          data: {
            id: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
            title: 'Eid Holiday',
            userId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
            businessId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7d',
            startDate: '2026-06-16T00:00:00.000Z',
            endDate: '2026-06-17T00:00:00.000Z',
            startTime: '09:00',
            endTime: '17:00',
            recurrence: {
              recurrenceType: 'standard',
              recurrenceRule: {
                frequency: 'Daily',
                custom: { interval: 1 },
                end: 'never',
              },
            },
            createdAt: '2026-01-01T00:00:00.000Z',
            createdBy: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7e',
            updatedAt: '2026-01-01T00:00:00.000Z',
            updatedBy: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7e',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Time-off not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const FindAllTimeoffsByUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all time-off entries for a user' }),
    ApiParam({
      name: 'userId',
      description: 'User ID',
      example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Time-off entries retrieved successfully',
      schema: {
        example: {
          data: [
            {
              id: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
              title: 'Eid Holiday',
              userId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
              businessId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7d',
              startDate: '2026-06-16T00:00:00.000Z',
              endDate: '2026-06-17T00:00:00.000Z',
              startTime: '09:00',
              endTime: '17:00',
              recurrence: null,
              createdAt: '2026-01-01T00:00:00.000Z',
              createdBy: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7e',
              updatedAt: '2026-06-01T00:00:00.000Z',
              updatedBy: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7e',
            },
          ],
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to view these time-off entries',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const EditTimeoffDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update an existing time-off entry' }),
    ApiParam({
      name: 'id',
      description: 'Time-off ID',
      example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
    }),
    ApiBody({ type: EditTimeoffDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Time-off updated successfully',
      schema: {
        example: {
          data: { message: 'success' },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Time-off not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to edit this time-off entry',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const DeleteTimeoffDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a time-off entry by ID' }),
    ApiParam({
      name: 'id',
      description: 'Time-off ID',
      example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Time-off deleted successfully',
      schema: {
        example: {
          data: { message: 'success' },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Time-off not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to delete this time-off entry',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );
