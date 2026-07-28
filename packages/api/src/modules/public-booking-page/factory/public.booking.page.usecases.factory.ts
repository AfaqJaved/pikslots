import { Inject, Injectable } from '@nestjs/common';
import { IFindBookingPageDetailsByBusinessSlugUseCase } from '@pikslots/domain';
import type { FindBookingPageDetailsByBusinessSlugUseCase } from '@pikslots/domain';

@Injectable()
export class PublicBookingPageUseCaseFactory {
  @Inject(IFindBookingPageDetailsByBusinessSlugUseCase)
  public readonly findBookingPageDetailsByBusinessUseCase: FindBookingPageDetailsByBusinessSlugUseCase;
}
