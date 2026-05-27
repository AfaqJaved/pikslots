import { Inject, Injectable } from '@nestjs/common';
import {
  GetAllBusinessOwnersUseCase,
  IUserRepository,
  InfrastructureError,
  Result,
  User,
} from '@pikslots/domain';
import type { UserRepository } from '@pikslots/domain';

@Injectable()
export class GetAllBusinessOwnersUseCaseImpl implements GetAllBusinessOwnersUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<Result<User[], InfrastructureError>> {
    return this.userRepository.findAllByRole('Business Owner');
  }
}
