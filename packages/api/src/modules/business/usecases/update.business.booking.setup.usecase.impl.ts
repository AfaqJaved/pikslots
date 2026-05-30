import { Inject, Injectable } from '@nestjs/common';
import {
  Business,
  IBusinessRepository,
  InfrastructureError,
  Result,
  err,
  ok,
} from '@pikslots/domain';
import type {
  BusinessNotFoundError,
  BusinessRepository,
  UpdateBusinessBookingSetupCommand,
  UpdateBusinessBookingSetupUseCase,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const BUSINESS_NOT_FOUND = (id: string): BusinessNotFoundError => ({
  kind: 'business_not_found',
  by: 'id',
  value: id,
  message: `Business not found against ${id}`,
  timestamp: new Date(),
});

@Injectable()
export class UpdateBusinessBookingSetupUseCaseImpl implements UpdateBusinessBookingSetupUseCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: BusinessRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: UpdateBusinessBookingSetupCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>> {
    const findResult = await this.businessRepository.findById(command.id);

    if (!findResult.ok) return err(findResult.error as InfrastructureError);

    const business = findResult.value;

    if (!business) return err(BUSINESS_NOT_FOUND(command.id));

    const updated = business.updateBookingSetup({
      bookAppointmentSectionVisible: command.bookAppointmentSectionVisible,
      bookClassSectionVisible: command.bookClassSectionVisible,
      aboutUsSectionVisible: command.aboutUsSectionVisible,
      ourTeamSectionVisible: command.ourTeamSectionVisible,
      servicesSectionVisible: command.servicesSectionVisible,
      classesSectionVisible: command.classesSectionVisible,
      showFirstAvailable: command.showFirstAvailable,
      skipTeamSelection: command.skipTeamSelection,
      allowToBookMultipleServices: command.allowToBookMultipleServices,
      bypassTeamMemberSelection: command.bypassTeamMemberSelection,
      customerLoginEnabled: command.customerLoginEnabled,
      customerLoginRequired: command.customerLoginRequired,
      hidePikslotsBranding: command.hidePikslotsBranding,
      accordionView: command.accordionView,
      allowRescheduling: command.allowRescheduling,
      allowCancellations: command.allowCancellations,
      showBookNewButton: command.showBookNewButton,
      nameEnabled: command.nameEnabled,
      nameRequired: command.nameRequired,
      emailEnabled: command.emailEnabled,
      emailRequired: command.emailRequired,
      phoneEnabled: command.phoneEnabled,
      phoneRequired: command.phoneRequired,
      addressEnabled: command.addressEnabled,
      addressRequired: command.addressRequired,
      updatedBy: this.securityContext.userId,
    });

    const updateResult = await this.businessRepository.update(updated);
    if (!updateResult.ok)
      return err(
        updateResult.error as BusinessNotFoundError | InfrastructureError,
      );

    return ok(updated);
  }
}
