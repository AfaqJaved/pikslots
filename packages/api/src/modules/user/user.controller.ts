import { Body, Controller, Post } from '@nestjs/common';
import { LoginUserDto } from './dto/login.user.dto';
import { RegisterUserDto } from './dto/register.user.dto';
import { UserUsecasesFactory } from './factory/user.usecases.factory';
import { mapUserError } from './errors/user.errors.map';

@Controller('/users')
export class UserController {
  constructor(private readonly userUseCaseFactory: UserUsecasesFactory) {}

  @Post('/register')
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    const result =
      await this.userUseCaseFactory.registerUserUsecase.execute(
        registerUserDto,
      );

    if (!result.ok) return mapUserError(result.error);

    return result.value;
  }

  @Post('/login')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    const result =
      await this.userUseCaseFactory.loginUserUseCase.execute(loginUserDto);

    if (!result.ok) return mapUserError(result.error);

    return result.value;
  }
}
