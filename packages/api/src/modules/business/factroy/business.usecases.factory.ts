import { Inject, Injectable } from '@nestjs/common';
import {
  IFindAllRegisteredBusinessesUseCase,
  IFindBusinessByIdUseCase,
  IRegisterBusinessUseCase,
  IUpdateBusinessAppearanceUseCase,
  IUpdateBusinessBrandDetailsUseCase,
  IUpdateBusinessBookingPoliciesUseCase,
  IUpdateBusinessBookingSetupUseCase,
  IUpdateBusinessBookingCustomizationUseCase,
  IUpdateBusinessGeneralUseCase,
  IUpdateBusinessLocationUseCase,
  IUpdateBusinessTeamNotificationsUseCase,
  IUpdateBusinessCustomerNotificationsUseCase,
  IUpdateBusinessNotificationCustomizationUseCase,
  IUpdateBusinessHoursUseCase,
  IUpdateBusinessVisibilityUseCase,
  IUpdateBusinessLinksUseCase,
  IUpdateBusinessContactDetailsUseCase,
} from '@pikslots/domain';
import type {
  FindAllRegisteredBusinessesUseCase,
  FindBusinessByIdUseCase,
  RegisterBusinessUseCase,
  UpdateBusinessAppearanceUseCase,
  UpdateBusinessBookingPoliciesUseCase,
  UpdateBusinessBookingSetupUseCase,
  UpdateBusinessBookingCustomizationUseCase,
  UpdateBusinessBrandDetailsUseCase,
  UpdateBusinessGeneralUseCase,
  UpdateBusinessLocationUseCase,
  UpdateBusinessTeamNotificationsUseCase,
  UpdateBusinessCustomerNotificationsUseCase,
  UpdateBusinessNotificationCustomizationUseCase,
  UpdateBusinessHoursUseCase,
  UpdateBusinessVisibilityUseCase,
  UpdateBusinessLinksUseCase,
  UpdateBusinessContactDetailsUseCase,
} from '@pikslots/domain';

@Injectable()
export class BusinessUseCaseFactory {
  @Inject(IRegisterBusinessUseCase)
  public readonly registerBusinessUseCase: RegisterBusinessUseCase;

  @Inject(IFindAllRegisteredBusinessesUseCase)
  public readonly findAllRegisteredBusinessesUseCase: FindAllRegisteredBusinessesUseCase;

  @Inject(IFindBusinessByIdUseCase)
  public readonly findBusinessByIdUseCase: FindBusinessByIdUseCase;

  @Inject(IUpdateBusinessBrandDetailsUseCase)
  public readonly updateBusinessBrandDetailsUseCase: UpdateBusinessBrandDetailsUseCase;

  @Inject(IUpdateBusinessAppearanceUseCase)
  public readonly updateBusinessAppearanceUseCase: UpdateBusinessAppearanceUseCase;

  @Inject(IUpdateBusinessLocationUseCase)
  public readonly updateBusinessLocationUseCase: UpdateBusinessLocationUseCase;

  @Inject(IUpdateBusinessGeneralUseCase)
  public readonly updateBusinessGeneralUseCase: UpdateBusinessGeneralUseCase;

  @Inject(IUpdateBusinessBookingPoliciesUseCase)
  public readonly updateBusinessBookingPoliciesUseCase: UpdateBusinessBookingPoliciesUseCase;

  @Inject(IUpdateBusinessBookingSetupUseCase)
  public readonly updateBusinessBookingSetupUseCase: UpdateBusinessBookingSetupUseCase;

  @Inject(IUpdateBusinessBookingCustomizationUseCase)
  public readonly updateBusinessBookingCustomizationUseCase: UpdateBusinessBookingCustomizationUseCase;

  @Inject(IUpdateBusinessVisibilityUseCase)
  public readonly updateBusinessVisibilityUseCase: UpdateBusinessVisibilityUseCase;

  @Inject(IUpdateBusinessTeamNotificationsUseCase)
  public readonly updateBusinessTeamNotificationsUseCase: UpdateBusinessTeamNotificationsUseCase;

  @Inject(IUpdateBusinessCustomerNotificationsUseCase)
  public readonly updateBusinessCustomerNotificationsUseCase: UpdateBusinessCustomerNotificationsUseCase;

  @Inject(IUpdateBusinessNotificationCustomizationUseCase)
  public readonly updateBusinessNotificationCustomizationUseCase: UpdateBusinessNotificationCustomizationUseCase;

  @Inject(IUpdateBusinessHoursUseCase)
  public readonly updateBusinessHoursUseCase: UpdateBusinessHoursUseCase;

  @Inject(IUpdateBusinessLinksUseCase)
  public readonly updateBusinessLinksUseCase: UpdateBusinessLinksUseCase;

  @Inject(IUpdateBusinessContactDetailsUseCase)
  public readonly updateBusinessContactDetailsUseCase: UpdateBusinessContactDetailsUseCase;
}
