import { Module } from '@nestjs/common';
import { TimeOffController } from './timeoff.controller';
import { TimeOffRepositoryImpl } from './repository/timeoff.repository.impl';
import { ITimeoffRepository } from '@pikslots/domain';
import { TimeoffUsecasesFactory } from './factory/timeoff.usecases.factory';
import { TIMEOFF_USECASES } from './usecases';

@Module({
  imports: [],
  controllers: [TimeOffController],
  providers: [
    TimeoffUsecasesFactory,
    ...TIMEOFF_USECASES,
    {
      provide: ITimeoffRepository,
      useClass: TimeOffRepositoryImpl,
    },
  ],
})
export class TimeoffModule {}
