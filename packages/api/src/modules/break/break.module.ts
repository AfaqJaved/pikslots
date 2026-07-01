import { Module } from '@nestjs/common';
import { BreakUseCasesFactory } from './factory/break.usecases.factory';
import { BREAK_USECASES } from './usecases';
import { BreakRepositoryImpl } from './repository/break.repository.impl';
import { IBreakRepository } from '@pikslots/domain';
import { BreakController } from './break.controller';

@Module({
  imports: [],
  controllers: [BreakController],
  providers: [
    BreakUseCasesFactory,
    ...BREAK_USECASES,
    { useClass: BreakRepositoryImpl, provide: IBreakRepository },
  ],
})
export class BreakModule {}
