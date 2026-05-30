import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business, WeekDay } from '../business.entity';

export interface UpdateBusinessBookingCustomizationCommand {
  id: string;
  // bookingCustomization
  language: string;
  timeFormat: '12 hours' | '24 hours';
  weekStartsOn: WeekDay;
  showBookAnotherAppointmentButton: boolean;
  showServiceAndClassPrices: boolean;
  showServiceAndClassDuration: boolean;
  showBusinessHours: boolean;
  showLocalTime: boolean;
  // bookingLabelOverrides
  labelService: string;
  labelClass: string;
  labelTeamMember: string;
  labelCity: string;
  labelState: string;
  labelPostalCode: string;
  termsLabel: string;
  termsLink: string;
  requireTermsAcceptance: boolean;
  redirectLabel: string;
  redirectLink: string;
}

export const IUpdateBusinessBookingCustomizationUseCase = Symbol(
  'IUpdateBusinessBookingCustomizationUseCase',
);

export interface UpdateBusinessBookingCustomizationUseCase {
  execute(
    command: UpdateBusinessBookingCustomizationCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>>;
}
