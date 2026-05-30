import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { mapBusinessError } from './errors/business.errors.map';
import { RegisterBusinessDto } from './dto/register.business.dto';
import { UpdateBusinessBrandDetailsDto } from './dto/update.business.brand.details.dto';
import { UpdateBusinessAppearanceDto } from './dto/update.business.appearance.dto';
import { UpdateBusinessLocationDto } from './dto/update.business.location.dto';
import { UpdateBusinessGeneralDto } from './dto/update.business.general.dto';
import { UpdateBusinessBookingPoliciesDto } from './dto/update.business.booking.policies.dto';
import { UpdateBusinessBookingSetupDto } from './dto/update.business.booking.setup.dto';
import { UpdateBusinessBookingCustomizationDto } from './dto/update.business.booking.customization.dto';
import { UpdateBusinessVisibilityDto } from './dto/update.business.visibility.dto';
import { UpdateBusinessTeamNotificationsDto } from './dto/update.business.team.notifications.dto';
import { UpdateBusinessCustomerNotificationsDto } from './dto/update.business.customer.notifications.dto';
import { UpdateBusinessNotificationCustomizationDto } from './dto/update.business.notification.customization.dto';
import { UpdateBusinessHoursDto } from './dto/update.business.hours.dto';
import { UpdateBusinessLinksDto } from './dto/update.business.links.dto';
import {
  GetAllBusinessesDocs,
  RegisterBusinessDocs,
  UpdateBusinessAppearanceDocs,
  UpdateBusinessBookingCustomizationDocs,
  UpdateBusinessBookingPoliciesDocs,
  UpdateBusinessBookingSetupDocs,
  UpdateBusinessBrandDetailsDocs,
  UpdateBusinessGeneralDocs,
  UpdateBusinessLocationDocs,
  UpdateBusinessTeamNotificationsDocs,
  UpdateBusinessCustomerNotificationsDocs,
  UpdateBusinessNotificationCustomizationDocs,
  UpdateBusinessHoursDocs,
  UpdateBusinessVisibilityDocs,
  UpdateBusinessLinksDocs,
} from './docs/business.controller.docs';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import type {
  GetAllBusinessesResponse,
  RegisterBusinessResponse,
  UpdateBusinessAppearanceResponse,
  UpdateBusinessBookingCustomizationResponse,
  UpdateBusinessBookingPoliciesResponse,
  UpdateBusinessBookingSetupResponse,
  UpdateBusinessBrandDetailsResponse,
  UpdateBusinessGeneralResponse,
  UpdateBusinessLocationResponse,
  UpdateBusinessTeamNotificationsResponse,
  UpdateBusinessCustomerNotificationsResponse,
  UpdateBusinessNotificationCustomizationResponse,
  UpdateBusinessHoursResponse,
  UpdateBusinessVisibilityResponse,
  UpdateBusinessLinksResponse,
} from '@pikslots/shared';
import { BusinessUseCaseFactory } from './factroy/business.usecases.factory';
import { RolesGuard } from 'src/shared/security/guards/roles.guard';
import { Roles } from 'src/shared/security/guards/roles.decorator';
import e from 'express';

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
      businessHours: b.businessHours,
      businessLinks: b.businessLinks,
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

  @UpdateBusinessBrandDetailsDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(':id/brand-details')
  async updateBusinessBrandDetails(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessBrandDetailsDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<UpdateBusinessBrandDetailsResponse>
  > {
    const result =
      await this.businessUseCaseFactory.updateBusinessBrandDetailsUseCase.execute(
        {
          id,
          bannerImageUrl: dto.bannerImageUrl,
          logoUrl: dto.logoUrl,
          name: dto.name,
          slug: dto.slug,
          industry: dto.industry,
          about: dto.about,
        },
      );

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;
    const response: UpdateBusinessBrandDetailsResponse = {
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
      businessLinks: b.businessLinks,
      bookingSetup: b.bookingSetup,
      bookingContactFields: b.bookingContactFields,
      bookingCustomization: b.bookingCustomization,
      bookingLabelOverrides: b.bookingLabelOverrides,
      businessHours: b.businessHours,
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
    };

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(response, HttpStatus.OK);
  }

  @UpdateBusinessAppearanceDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(':id/appearance')
  async updateBusinessAppearance(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessAppearanceDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<UpdateBusinessAppearanceResponse>
  > {
    const result =
      await this.businessUseCaseFactory.updateBusinessAppearanceUseCase.execute(
        {
          id,
          brandColor: dto.brandColor,
          brandButtonShape: dto.brandButtonShape,
          theme: dto.theme,
          gallaryPhotosUrls: dto.gallaryPhotosUrls,
        },
      );

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;
    const response: UpdateBusinessAppearanceResponse = {
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
      businessLinks: b.businessLinks,
      locationDetails: b.locationDetails,
      bookingPolicies: b.bookingPolicies,
      bookingSetup: b.bookingSetup,
      bookingContactFields: b.bookingContactFields,
      bookingCustomization: b.bookingCustomization,
      bookingLabelOverrides: b.bookingLabelOverrides,
      businessHours: b.businessHours,
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
    };

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(response, HttpStatus.OK);
  }

  @UpdateBusinessLocationDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(':id/location')
  async updateBusinessLocation(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessLocationDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<UpdateBusinessLocationResponse>
  > {
    const result =
      await this.businessUseCaseFactory.updateBusinessLocationUseCase.execute({
        id,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zip: dto.zip,
        country: dto.country,
        currency: dto.currency,
      });

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;

    const response: UpdateBusinessLocationResponse = {
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
      businessLinks: b.businessLinks,
      bookingContactFields: b.bookingContactFields,
      bookingCustomization: b.bookingCustomization,
      bookingLabelOverrides: b.bookingLabelOverrides,
      businessHours: b.businessHours,
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
    };

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(response, HttpStatus.OK);
  }

  @UpdateBusinessGeneralDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(':id/general')
  async updateBusinessGeneral(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessGeneralDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<UpdateBusinessGeneralResponse>
  > {
    const result =
      await this.businessUseCaseFactory.updateBusinessGeneralUseCase.execute({
        id,
        language: dto.language,
      });

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;
    const response: UpdateBusinessGeneralResponse = {
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
      businessHours: b.businessHours,
      teamNotifications: b.teamNotifications,
      customerNotifications: b.customerNotifications,
      notificationCustomization: b.notificationCustomization,
      subscriptionPlan: b.subscriptionPlan,
      businessLinks: b.businessLinks,
      subscriptionStatus: b.subscriptionStatus,
      trialEndsAt: b.trialEndsAt,
      createdAt: b.createdAt,
      createdBy: b.createdBy,
      updatedAt: b.updatedAt,
      updatedBy: b.updatedBy,
    };

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(response, HttpStatus.OK);
  }

  @UpdateBusinessBookingPoliciesDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(':id/booking-policies')
  async updateBusinessBookingPolicies(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessBookingPoliciesDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<UpdateBusinessBookingPoliciesResponse>
  > {
    const result =
      await this.businessUseCaseFactory.updateBusinessBookingPoliciesUseCase.execute(
        {
          id,
          leadTime: dto.leadTime,
          scheduleWindow: dto.scheduleWindow,
          cancellationPolicy: dto.cancellationPolicy,
          bookingPolicyText: dto.bookingPolicyText,
          showPolicyOnBookingPage: dto.showPolicyOnBookingPage,
        },
      );

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;
    const response: UpdateBusinessBookingPoliciesResponse = {
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
      businessLinks: b.businessLinks,
      bookingContactFields: b.bookingContactFields,
      bookingCustomization: b.bookingCustomization,
      bookingLabelOverrides: b.bookingLabelOverrides,
      businessHours: b.businessHours,
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
    };

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(response, HttpStatus.OK);
  }

  @UpdateBusinessBookingSetupDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(':id/booking-setup')
  async updateBusinessBookingSetup(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessBookingSetupDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<UpdateBusinessBookingSetupResponse>
  > {
    const result =
      await this.businessUseCaseFactory.updateBusinessBookingSetupUseCase.execute(
        {
          id,
          bookAppointmentSectionVisible: dto.bookAppointmentSectionVisible,
          bookClassSectionVisible: dto.bookClassSectionVisible,
          aboutUsSectionVisible: dto.aboutUsSectionVisible,
          ourTeamSectionVisible: dto.ourTeamSectionVisible,
          servicesSectionVisible: dto.servicesSectionVisible,
          classesSectionVisible: dto.classesSectionVisible,
          showFirstAvailable: dto.showFirstAvailable,
          skipTeamSelection: dto.skipTeamSelection,
          allowToBookMultipleServices: dto.allowToBookMultipleServices,
          bypassTeamMemberSelection: dto.bypassTeamMemberSelection,
          customerLoginEnabled: dto.customerLoginEnabled,
          customerLoginRequired: dto.customerLoginRequired,
          hidePikslotsBranding: dto.hidePikslotsBranding,
          accordionView: dto.accordionView,
          allowRescheduling: dto.allowRescheduling,
          allowCancellations: dto.allowCancellations,
          showBookNewButton: dto.showBookNewButton,
          nameEnabled: dto.nameEnabled,
          nameRequired: dto.nameRequired,
          emailEnabled: dto.emailEnabled,
          emailRequired: dto.emailRequired,
          phoneEnabled: dto.phoneEnabled,
          phoneRequired: dto.phoneRequired,
          addressEnabled: dto.addressEnabled,
          addressRequired: dto.addressRequired,
        },
      );

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;
    const response: UpdateBusinessBookingSetupResponse = {
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
      businessHours: b.businessHours,
      teamNotifications: b.teamNotifications,
      customerNotifications: b.customerNotifications,
      notificationCustomization: b.notificationCustomization,
      businessLinks: b.businessLinks,
      subscriptionPlan: b.subscriptionPlan,
      subscriptionStatus: b.subscriptionStatus,
      trialEndsAt: b.trialEndsAt,
      createdAt: b.createdAt,
      createdBy: b.createdBy,
      updatedAt: b.updatedAt,
      updatedBy: b.updatedBy,
    };

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(response, HttpStatus.OK);
  }

  @UpdateBusinessBookingCustomizationDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(':id/booking-customization')
  async updateBusinessBookingCustomization(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessBookingCustomizationDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<UpdateBusinessBookingCustomizationResponse>
  > {
    const result =
      await this.businessUseCaseFactory.updateBusinessBookingCustomizationUseCase.execute(
        {
          id,
          language: dto.language,
          timeFormat: dto.timeFormat,
          weekStartsOn: dto.weekStartsOn,
          showBookAnotherAppointmentButton:
            dto.showBookAnotherAppointmentButton,
          showServiceAndClassPrices: dto.showServiceAndClassPrices,
          showServiceAndClassDuration: dto.showServiceAndClassDuration,
          showBusinessHours: dto.showBusinessHours,
          showLocalTime: dto.showLocalTime,
          labelService: dto.labelService,
          labelClass: dto.labelClass,
          labelTeamMember: dto.labelTeamMember,
          labelCity: dto.labelCity,
          labelState: dto.labelState,
          labelPostalCode: dto.labelPostalCode,
          termsLabel: dto.termsLabel,
          termsLink: dto.termsLink,
          requireTermsAcceptance: dto.requireTermsAcceptance,
          redirectLabel: dto.redirectLabel,
          redirectLink: dto.redirectLink,
        },
      );

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;
    const response: UpdateBusinessBookingCustomizationResponse = {
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
      businessLinks: b.businessLinks,
      bookingContactFields: b.bookingContactFields,
      bookingCustomization: b.bookingCustomization,
      bookingLabelOverrides: b.bookingLabelOverrides,
      businessHours: b.businessHours,
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
    };

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(response, HttpStatus.OK);
  }

  @UpdateBusinessVisibilityDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(':id/visibility')
  async updateBusinessVisibility(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessVisibilityDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<UpdateBusinessVisibilityResponse>
  > {
    const result =
      await this.businessUseCaseFactory.updateBusinessVisibilityUseCase.execute(
        {
          id,
          appearInSearchResults: dto.appearInSearchResults,
        },
      );

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;
    const response: UpdateBusinessVisibilityResponse = {
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
      businessLinks: b.businessLinks,
      locationDetails: b.locationDetails,
      bookingPolicies: b.bookingPolicies,
      bookingSetup: b.bookingSetup,
      bookingContactFields: b.bookingContactFields,
      bookingCustomization: b.bookingCustomization,
      bookingLabelOverrides: b.bookingLabelOverrides,
      businessHours: b.businessHours,
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
    };

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(response, HttpStatus.OK);
  }

  @UpdateBusinessTeamNotificationsDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(':id/team-notifications')
  async updateBusinessTeamNotifications(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessTeamNotificationsDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<UpdateBusinessTeamNotificationsResponse>
  > {
    const result =
      await this.businessUseCaseFactory.updateBusinessTeamNotificationsUseCase.execute(
        {
          id,
          notifyBookingConfirmation: dto.notifyBookingConfirmation,
          notifyBookingChanges: dto.notifyBookingChanges,
          notifyBookingCancellations: dto.notifyBookingCancellations,
          bookingRemindersTime: dto.bookingRemindersTime,
          extraCCEmails: dto.extraCCEmails,
        },
      );

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;
    const response: UpdateBusinessTeamNotificationsResponse = {
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
      businessLinks: b.businessLinks,
      locationDetails: b.locationDetails,
      bookingPolicies: b.bookingPolicies,
      bookingSetup: b.bookingSetup,
      bookingContactFields: b.bookingContactFields,
      bookingCustomization: b.bookingCustomization,
      bookingLabelOverrides: b.bookingLabelOverrides,
      businessHours: b.businessHours,
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
    };

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(response, HttpStatus.OK);
  }

  @UpdateBusinessCustomerNotificationsDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(':id/customer-notifications')
  async updateBusinessCustomerNotifications(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessCustomerNotificationsDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<UpdateBusinessCustomerNotificationsResponse>
  > {
    const result =
      await this.businessUseCaseFactory.updateBusinessCustomerNotificationsUseCase.execute(
        {
          id,
          notifyBookingConfirmation: dto.notifyBookingConfirmation,
          notifyBookingChanges: dto.notifyBookingChanges,
          notifyBookingCancellations: dto.notifyBookingCancellations,
          bookingRemindersTime: dto.bookingRemindersTime,
        },
      );

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;
    const response: UpdateBusinessCustomerNotificationsResponse = {
      id: b.id,
      ownerId: b.ownerId,
      slug: b.slug,
      name: b.name,
      businessLinks: b.businessLinks,
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
      businessHours: b.businessHours,
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
    };

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(response, HttpStatus.OK);
  }

  @UpdateBusinessNotificationCustomizationDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(':id/notification-customization')
  async updateBusinessNotificationCustomization(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessNotificationCustomizationDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<UpdateBusinessNotificationCustomizationResponse>
  > {
    const result =
      await this.businessUseCaseFactory.updateBusinessNotificationCustomizationUseCase.execute(
        {
          id,
          emailSenderName: dto.emailSenderName,
          emailSignature: dto.emailSignature,
        },
      );

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;
    const response: UpdateBusinessNotificationCustomizationResponse = {
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
      businessHours: b.businessHours,
      teamNotifications: b.teamNotifications,
      customerNotifications: b.customerNotifications,
      notificationCustomization: b.notificationCustomization,
      subscriptionPlan: b.subscriptionPlan,
      businessLinks: b.businessLinks,
      subscriptionStatus: b.subscriptionStatus,
      trialEndsAt: b.trialEndsAt,
      createdAt: b.createdAt,
      createdBy: b.createdBy,
      updatedAt: b.updatedAt,
      updatedBy: b.updatedBy,
    };

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(response, HttpStatus.OK);
  }

  @UpdateBusinessHoursDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(':id/business-hours')
  async updateBusinessHours(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessHoursDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<UpdateBusinessHoursResponse>
  > {
    const result =
      await this.businessUseCaseFactory.updateBusinessHoursUseCase.execute({
        id,
        businessHours: {
          monday: dto.monday,
          tuesday: dto.tuesday,
          wednesday: dto.wednesday,
          thursday: dto.thursday,
          friday: dto.friday,
          saturday: dto.saturday,
          sunday: dto.sunday,
        },
      });

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;
    const response: UpdateBusinessHoursResponse = {
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
      businessHours: b.businessHours,
      businessLinks: b.businessLinks,
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
    };

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(response, HttpStatus.OK);
  }

  @UpdateBusinessLinksDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Patch(':id/links')
  async updateBusinessLinks(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessLinksDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<UpdateBusinessLinksResponse>
  > {
    const result =
      await this.businessUseCaseFactory.updateBusinessLinksUseCase.execute({
        id,
        businessLinks: {
          Website: dto.Website,
          Instagram: dto.Instagram,
          Facebook: dto.Facebook,
          Tiktok: dto.Tiktok,
          X: dto.X,
          Youtube: dto.Youtube,
          LinkedIn: dto.LinkedIn,
        },
      });

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;
    const response: UpdateBusinessLinksResponse = {
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
      businessHours: b.businessHours,
      businessLinks: b.businessLinks,
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
    };

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse(response, HttpStatus.OK);
  }
}
