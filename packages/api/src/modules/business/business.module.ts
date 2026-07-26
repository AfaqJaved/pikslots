import { Module } from '@nestjs/common';
import { IBusinessRepository } from '@pikslots/domain';
import { BUSINESS_USECASES } from './usecases';
import { BusinessUseCaseFactory } from './factroy/business.usecases.factory';
import { BusinessController } from './business.controller';
import { BusinessRepositoryImpl } from './repository/business.repository.impl';
import { BUSINESS_EVENTS } from './events';

@Module({
  providers: [
    { useClass: BusinessRepositoryImpl, provide: IBusinessRepository },
    ...BUSINESS_USECASES,
    ...BUSINESS_EVENTS,
    BusinessUseCaseFactory,
  ],
  controllers: [BusinessController],
})
export class BusinessModule {}
