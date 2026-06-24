import { Inject, Injectable } from '@nestjs/common';
import {
  IDeleteBookingUseCase,
  IEditBookingUseCase,
  IFindAllBookingsByBusinessForUserUseCase,
  IFindBookingByIdUseCase,
  IRegisterBookingUseCase,
} from '@pikslots/domain';
import type {
  DeleteBookingUseCase,
  EditBookingUseCase,
  FindAllBookingsByBusinessForUserUseCase,
  FindBookingByIdUseCase,
  RegisterBookingUseCase,
} from '@pikslots/domain';

@Injectable()
export class BookingUseCasesFactory {
  @Inject(IRegisterBookingUseCase)
  public readonly registerBookingUseCase: RegisterBookingUseCase;

  @Inject(IFindAllBookingsByBusinessForUserUseCase)
  public readonly findAllBookingsByBusinessUseCase: FindAllBookingsByBusinessForUserUseCase;

  @Inject(IFindBookingByIdUseCase)
  public readonly findBookingByIdUseCase: FindBookingByIdUseCase;

  @Inject(IDeleteBookingUseCase)
  public readonly deleteBookingUseCase: DeleteBookingUseCase;

  @Inject(IEditBookingUseCase)
  public readonly editBookingUseCase: EditBookingUseCase;
}
