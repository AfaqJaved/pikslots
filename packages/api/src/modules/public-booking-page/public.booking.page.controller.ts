import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Res,
  Inject,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { PUBLIC_BOOKING_PAGE_ENDPOINTS } from '@pikslots/shared';
import type { PublicBookingPage } from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import { PublicBookingPageUseCaseFactory } from './factory/public.booking.page.usecases.factory';
import { mapPublicBookingPageError } from './errors/public.booking.page.errors.map';
import { GetPublicBookingPageDetailsDocs } from './docs/public.booking.page.controller.docs';
import {
  IPikslotS3Service,
  type PikslotS3Service,
} from 'src/shared/s3/s3.service';
import { PublicBookingPageResponseMapper } from './mappers/public.booking.page.response.mapper';

@ApiTags('PublicBookingPage')
@Controller('')
export class PublicBookingPageController {
  constructor(
    private readonly publicBookingPageUseCaseFactory: PublicBookingPageUseCaseFactory,
    @Inject(IPikslotS3Service) private readonly s3Service: PikslotS3Service,
  ) {}

  @Get(PUBLIC_BOOKING_PAGE_ENDPOINTS.GET_PUBLIC_BOOKING_PAGE_DETAILS)
  @GetPublicBookingPageDetailsDocs()
  async GetBookingPageDetails(
    @Res({ passthrough: true }) res: Response,
    @Param('businessSlug') businessSlug: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<PublicBookingPage>
  > {
    const result =
      await this.publicBookingPageUseCaseFactory.findBookingPageDetailsByBusinessUseCase.execute(
        businessSlug,
      );

    if (!result.ok) {
      const errorResponse = mapPublicBookingPageError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const bookingPaeDetails: PublicBookingPage =
      await PublicBookingPageResponseMapper.toBookingPageResponse(
        this.s3Service,
        result.value,
      );

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(bookingPaeDetails, HttpStatus.OK);
  }
}
