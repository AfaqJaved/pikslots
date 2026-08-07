import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business } from '../business.entity';
import type { CustomContactField } from '../value-objects';

export interface UpdateBusinessBookingSetupCommand {
  id: string;
  // sections
  bookAppointmentSectionVisible: boolean;
  bookClassSectionVisible: boolean;
  aboutUsSectionVisible: boolean;
  ourTeamSectionVisible: boolean;
  servicesSectionVisible: boolean;
  classesSectionVisible: boolean;
  // booking flow
  showFirstAvailable: boolean;
  skipTeamSelection: boolean;
  allowToBookMultipleServices: boolean;
  bypassTeamMemberSelection: boolean;
  customerLoginEnabled: boolean;
  customerLoginRequired: boolean;
  hidePikslotsBranding: boolean;
  accordionView: boolean;
  allowRescheduling: boolean;
  allowCancellations: boolean;
  showBookNewButton: boolean;
  // contact fields
  nameEnabled: boolean;
  nameRequired: boolean;
  emailEnabled: boolean;
  emailRequired: boolean;
  phoneEnabled: boolean;
  phoneRequired: boolean;
  addressEnabled: boolean;
  addressRequired: boolean;
  customFields: CustomContactField[];
}

export const IUpdateBusinessBookingSetupUseCase = Symbol('IUpdateBusinessBookingSetupUseCase');

export interface UpdateBusinessBookingSetupUseCase {
  execute(
    command: UpdateBusinessBookingSetupCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>>;
}
