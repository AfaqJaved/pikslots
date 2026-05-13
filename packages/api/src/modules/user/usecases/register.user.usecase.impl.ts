import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IUserRepository,
  ok,
  RegisterUserCommand,
  RegisterUserUseCase,
  Result,
  User,
  UserAlreadyExistsError,
} from '@pickslots/domain';
import type { UserRepository } from '@pickslots/domain';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class RegisterUserUsecaseImpl implements RegisterUserUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: UserRepository,
  ) {}
  async execute(
    command: RegisterUserCommand,
  ): Promise<
    Result<{ message: 'success' }, UserAlreadyExistsError | InfrastructureError>
  > {
    const user: User = User.create({
      id: uuidv7(),
      username: command.username,
      password: command.password,
      name: command.name,
      email: command.email,
      phone: command.phone,
      role: command.role,
      timezone: command.timezone,
      createdBy: uuidv7(), // TODO: replace with actual user id from security context
    });

    console.log(JSON.stringify(user));

    const insertedUser = await this.userRepository.save(user);

    if (!insertedUser.ok) {
      return err(insertedUser.error);
    }

    return ok({ message: 'success' });
  }
}
