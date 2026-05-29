import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { RegisterBusinessDto } from '../dto/register.business.dto';
import { UpdateBusinessBrandDetailsDto } from '../dto/update.business.brand.details.dto';

export const GetAllBusinessesDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all registered businesses (superAdmin only)',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of all businesses returned successfully',
      schema: {
        example: {
          data: {
            businesses: [
              {
                id: 'uuid',
                name: "Joe's Barbershop",
                slug: 'joes-barbershop',
                email: 'contact@joesbarbershop.com',
                industry: 'salon_and_beauty',
                status: 'active',
                subscriptionPlan: 'free',
                createdAt: '2026-01-01T00:00:00.000Z',
              },
            ],
            total: 1,
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Access denied — superAdmin role required',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database or infrastructure failure',
      type: PikslotsBaseErrorResponse,
    }),
  );

export const UpdateBusinessBrandDetailsDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update brand details for a business' }),
    ApiParam({ name: 'id', description: 'Business ID', example: 'biz_01j...' }),
    ApiBody({ type: UpdateBusinessBrandDetailsDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Brand details updated successfully',
      schema: {
        example: {
          data: {
            id: 'biz_01j...',
            name: "Joe's Barbershop",
            slug: 'joes-barbershop',
            industry: 'salon_and_beauty',
            about: 'We are a premium barbershop...',
            brandDetail: {
              bannerImageUrl: 'https://cdn.example.com/banner.jpg',
              brandLogoUrl: 'https://cdn.example.com/logo.png',
            },
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Business not found',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Slug is already taken by another business',
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

export const RegisterBusinessDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new business (Platform Owner Only )' }),
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
      description: 'A business with this slug already exists',
      type: PikslotsBaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: PikslotsBaseErrorResponse,
    }),
  );
