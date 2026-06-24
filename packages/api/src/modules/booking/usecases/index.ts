import { Provider } from '@nestjs/common';
import {
  IEditBookingUseCase,
  IFindAllBookingsByBusinessForUserUseCase,
  IFindBookingByIdUseCase,
  IDeleteBookingUseCase,
  IRegisterBookingUseCase,
} from '@pikslots/domain';
import { FindAllBookingsByBusinessForUserUseCaseImpl } from './find.all.bookings.by.business.for.user.usecase.impl';
import { FindBookingByIdUseCaseImpl } from './find.booking.by.id.usecase.impl';
import { DeleteBookingUseCaseImpl } from './delete.booking.usecase.impl';
import { RegisterBookingUseCaseImpl } from './register.booking.usecase.impl';
import { EditBookingUseCaseImpl } from './edit.booking.usecase.impl';

export const BOOKING_USECASES: Provider[] = [
  { useClass: RegisterBookingUseCaseImpl, provide: IRegisterBookingUseCase },
  {
    useClass: FindAllBookingsByBusinessForUserUseCaseImpl,
    provide: IFindAllBookingsByBusinessForUserUseCase,
  },
  { useClass: FindBookingByIdUseCaseImpl, provide: IFindBookingByIdUseCase },
  { useClass: DeleteBookingUseCaseImpl, provide: IDeleteBookingUseCase },
  { useClass: EditBookingUseCaseImpl, provide: IEditBookingUseCase },
];
