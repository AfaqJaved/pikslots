import { Module } from '@nestjs/common';
import { UserRepositoryImpl } from './repository/user.repository.impl';
import { IUserRepository } from '@pikslots/domain';
import { UserController } from './user.controller';
import { USER_USECASES } from './usecases';
import { UserUsecasesFactory } from './factory/user.usecases.factory';
import { USER_EVENTS } from './events';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    { useClass: UserRepositoryImpl, provide: IUserRepository },
    ...USER_USECASES,
    UserUsecasesFactory,
    ...USER_EVENTS,
  ],
  exports: [],
})
export class UserModule {}
