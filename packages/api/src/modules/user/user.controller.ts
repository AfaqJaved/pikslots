import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseResponse } from 'src/shared/types/base.response';
import { mapUserError } from './errors/user.errors.map';
import { LoginUserDto } from './dto/login.user.dto';
import { RegisterUserDto } from './dto/register.user.dto';
import { UserUsecasesFactory } from './factory/user.usecases.factory';
import { BaseErrorResponse } from 'src/shared/types/base.error.response';
import { RegisterUserDocs, LoginUserDocs } from './docs/user.controller.docs';

@ApiTags('Users')
@Controller('/users')
export class UserController {
  constructor(private readonly userUseCaseFactory: UserUsecasesFactory) {}

  @RegisterUserDocs()
  @Post('/register')
  async registerUser(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<BaseErrorResponse | BaseResponse<{ message: 'success' }>> {
    const result =
      await this.userUseCaseFactory.registerUserUsecase.execute(
        registerUserDto,
      );

    if (!result.ok) return mapUserError(result.error);

    return new BaseResponse(result.value, HttpStatus.CREATED);
  }

  @LoginUserDocs()
  @Post('/login')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<
    | BaseErrorResponse
    | BaseResponse<{ accessToken: string; refreshToken: string }>
  > {
    const result =
      await this.userUseCaseFactory.loginUserUseCase.execute(loginUserDto);

    if (!result.ok) return mapUserError(result.error);

    return new BaseResponse(result.value, HttpStatus.OK);
  }
}
