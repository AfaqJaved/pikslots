import { Provider } from '@nestjs/common';
import { IFindBookingPageDetailsByBusinessSlugUseCase } from '@pikslots/domain';
import { FindBookingPageDetailsByBusinessSlugUseCaseImpl } from './find.booking.page.details.by.business.slug.usecase.impl';

export const PUBLIC_BOOKING_PAGE_USECASES: Provider[] = [
  {
    useClass: FindBookingPageDetailsByBusinessSlugUseCaseImpl,
    provide: IFindBookingPageDetailsByBusinessSlugUseCase,
  },
];
