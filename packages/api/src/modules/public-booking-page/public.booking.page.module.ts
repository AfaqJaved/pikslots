import { Module } from '@nestjs/common';
import { PublicBookingPageController } from './public.booking.page.controller';
import { PublicBookingPageRepositoryImpl } from './repository/public.booking.page.repository.impl';
import { IPublicBookingPageRepository } from '@pikslots/domain';
import { PublicBookingPageUseCaseFactory } from './factory/public.booking.page.usecases.factory';
import { PUBLIC_BOOKING_PAGE_USECASES } from './usecase';

@Module({
  imports: [],
  controllers: [PublicBookingPageController],
  providers: [
    {
      provide: IPublicBookingPageRepository,
      useClass: PublicBookingPageRepositoryImpl,
    },
    PublicBookingPageUseCaseFactory,
    ...PUBLIC_BOOKING_PAGE_USECASES,
  ],
})
export class PublicBookingPage {}
