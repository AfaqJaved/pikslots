import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseErrorResponse } from 'src/shared/types/base.error.response';
import { LoginUserDto } from '../dto/login.user.dto';
import { RegisterUserDto } from '../dto/register.user.dto';

export const RegisterUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiBody({ type: RegisterUserDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'User registered successfully',
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
      description: 'User with this email or username already exists',
      type: BaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      type: BaseErrorResponse,
    }),
  );

export const LoginUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Login with username/email and password' }),
    ApiBody({ type: LoginUserDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Login successful — returns access and refresh tokens',
      schema: {
        example: {
          data: {
            accessToken: '<jwt>',
            refreshToken: '<jwt>',
          },
          statusCode: 200,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid credentials',
      type: BaseErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
      type: BaseErrorResponse,
    }),
  );
