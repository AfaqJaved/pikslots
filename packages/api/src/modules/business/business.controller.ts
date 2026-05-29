import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { mapBusinessError } from './errors/business.errors.map';
import { RegisterBusinessDto } from './dto/register.business.dto';
import {
  GetAllBusinessesDocs,
  RegisterBusinessDocs,
} from './docs/business.controller.docs';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import type {
  GetAllBusinessesResponse,
  RegisterBusinessResponse,
} from '@pikslots/shared';
import { BusinessUseCaseFactory } from './factroy/business.usecases.factory';
import { RolesGuard } from 'src/shared/security/guards/roles.guard';
import { Roles } from 'src/shared/security/guards/roles.decorator';

@ApiTags('Businesses')
@Controller('/businesses')
export class BusinessController {
  constructor(
    private readonly businessUseCaseFactory: BusinessUseCaseFactory,
  ) {}

  @RegisterBusinessDocs()
  @Post('/register')
  @Roles('Platform Owner')
  async registerBusiness(
    @Res({ passthrough: true }) res: Response,
    @Body() registerBusinessDto: RegisterBusinessDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<RegisterBusinessResponse>
  > {
    const result =
      await this.businessUseCaseFactory.registerBusinessUseCase.execute(
        registerBusinessDto,
      );

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse(result.value, HttpStatus.CREATED);
  }

  @GetAllBusinessesDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner')
  @Get()
  async getAllBusinesses(
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<GetAllBusinessesResponse>
  > {
    const result =
      await this.businessUseCaseFactory.findAllRegisteredBusinessesUseCase.execute();

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const businesses: GetAllBusinessesResponse = result.value.map((b) => ({
      id: b.id,
      ownerId: b.ownerId,
      slug: b.slug,
      name: b.name,
      industry: b.industry,
      about: b.about,
      appearInSearchResults: b.appearInSearchResults,
      status: b.status,
      suspendedReason: b.suspendedReason,
      brandDetail: b.brandDetail,
      brandAppearanceDetails: b.brandApperanceDetails,
      locationDetails: b.locationDetails,
      bookingPolicies: b.bookingPolicies,
      bookingSetup: b.bookingSetup,
      bookingContactFields: b.bookingContactFields,
      bookingCustomization: b.bookingCustomization,
      bookingLabelOverrides: b.bookingLabelOverrides,
      teamNotifications: b.teamNotifications,
      customerNotifications: b.customerNotifications,
      notificationCustomization: b.notificationCustomization,
      subscriptionPlan: b.subscriptionPlan,
      subscriptionStatus: b.subscriptionStatus,
      trialEndsAt: b.trialEndsAt,
      createdAt: b.createdAt,
      createdBy: b.createdBy,
      updatedAt: b.updatedAt,
      updatedBy: b.updatedBy,
    }));

    res.status(HttpStatus.OK);

    return new PikslotsBaseResponse(businesses, HttpStatus.OK);
  }
}
