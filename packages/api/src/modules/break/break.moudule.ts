import { Module } from '@nestjs/common';
import { BreakController } from './break.controller';
import { BreakRepositoryImpl } from './repository/break.repository.impl';
import { IBreakRepository } from '@pikslots/domain';
import { BREAK_USECASE } from './usecases';
import { BreakUsecasesFactory } from './factory/break.usecases.factory';

@Module({
  imports: [],
  controllers: [BreakController],
  providers: [
    {
      useClass: BreakRepositoryImpl,
      provide: IBreakRepository,
    },
    ...BREAK_USECASE,
    BreakUsecasesFactory,
  ],
  exports: [],
})
export class BreakModule {}
