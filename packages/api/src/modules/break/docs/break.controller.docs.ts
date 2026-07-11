import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { CreateBreakDto } from '../dto/create.break.dto';
import { UpdateBreakDto } from '../dto/update.break.dto';

export const CreateBreakDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new break for a user' }),
    ApiBody({ type: CreateBreakDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Break created successfully',
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
      description: 'A break already exists for this time slot',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to create this break',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const FindBreaksByUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all breaks for a user' }),
    ApiParam({
      name: 'userId',
      description: 'User ID',
      example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Breaks retrieved successfully',
      schema: {
        example: {
          data: [
            {
              id: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
              day: 'monday',
              startTime: '09:00',
              endTime: '09:30',
              userId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
              businessId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7d',
            },
          ],
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to view these breaks',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const FindBreakByIdDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a break by ID' }),
    ApiParam({
      name: 'breakId',
      description: 'Break ID',
      example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Break retrieved successfully',
      schema: {
        example: {
          data: {
            id: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
            day: 'monday',
            startTime: '09:00',
            endTime: '09:30',
            userId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
            businessId: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7d',
            createdAt: '2026-01-01T00:00:00.000Z',
            createdBy: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
            updatedAt: '2026-01-01T00:00:00.000Z',
            updatedBy: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
            deletedAt: null,
            deletedBy: null,
            isDeleted: false,
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Break not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to view this break',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBreakDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update an existing break' }),
    ApiParam({
      name: 'breakId',
      description: 'Break ID',
      example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
    }),
    ApiBody({ type: UpdateBreakDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Break updated successfully',
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
      description: 'Break not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'A break already exists for this time slot',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to update this break',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const DeleteBreakDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a break by ID' }),
    ApiParam({
      name: 'breakId',
      description: 'Break ID',
      example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7b',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Break deleted successfully',
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
      description: 'Break not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Caller is not authorized to delete this break',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );
