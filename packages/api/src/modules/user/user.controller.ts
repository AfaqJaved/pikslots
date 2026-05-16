import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { mapUserError } from './errors/user.errors.map';
import { LoginUserDto } from './dto/login.user.dto';
import { RegisterUserDto } from './dto/register.user.dto';
import { UserUsecasesFactory } from './factory/user.usecases.factory';
import {
  RegisterUserDocs,
  LoginUserDocs,
  RefreshUserSessionDocs,
  LogoutUserDocs,
} from './docs/user.controller.docs';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import type {
  LoginUserResponse,
  LogoutUserResponse,
  RefreshUserSessionResponse,
  RegisterUserResponse,
} from '@pikslots/shared';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/shared/config/env';

@ApiTags('Users')
@Controller('/users')
export class UserController {
  constructor(
    private readonly userUseCaseFactory: UserUsecasesFactory,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  @RegisterUserDocs()
  @Post('/register')
  async registerUser(
    @Res({ passthrough: true }) res: Response,
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<RegisterUserResponse>
  > {
    const result =
      await this.userUseCaseFactory.registerUserUsecase.execute(
        registerUserDto,
      );

    if (!result.ok) {
      const errorResponse = mapUserError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse(result.value, HttpStatus.CREATED);
  }

  @LoginUserDocs()
  @Post('/login')
  async loginUser(
    @Res({ passthrough: true }) res: Response,
    @Body()
    loginUserDto: LoginUserDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<LoginUserResponse>
  > {
    const result =
      await this.userUseCaseFactory.loginUserUseCase.execute(loginUserDto);

    if (!result.ok) {
      const errorResponse = mapUserError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.cookie('jid', result.value.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/users/refresh',
    });

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<LoginUserResponse>(
      { accessToken: result.value.accessToken },
      HttpStatus.OK,
    );
  }

  @RefreshUserSessionDocs()
  @Post('/refresh')
  async refreshUserSession(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<RefreshUserSessionResponse>
  > {
    const currentRefreshToken = req.cookies?.jid;
    if (!currentRefreshToken) throw new UnauthorizedException();
    const result =
      await this.userUseCaseFactory.refreshUserSessionUseCase.execute({
        currentRefreshToken,
      });

    if (!result.ok) {
      const errorResponse = mapUserError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.cookie('jid', result.value.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/users/refresh',
    });

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<RefreshUserSessionResponse>(
      { accessToken: result.value.accessToken },
      HttpStatus.OK,
    );
  }

  @LogoutUserDocs()
  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  logout(
    @Res({ passthrough: true }) res: Response,
  ): PikslotsBaseResponse<LogoutUserResponse> {
    res.clearCookie('jid', { path: '/users/refresh' });
    return new PikslotsBaseResponse<LogoutUserResponse>(
      { message: 'success' },
      HttpStatus.OK,
    );
  }
}
