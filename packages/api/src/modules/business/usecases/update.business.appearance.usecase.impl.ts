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
  UpdateBusinessAppearanceCommand,
  UpdateBusinessAppearanceUseCase,
} from '@pikslots/domain';

const BUSINESS_NOT_FOUND = (id: string): BusinessNotFoundError => ({
  kind: 'business_not_found',
  by: 'id',
  value: id,
  message: `Business not found against ${id}`,
  timestamp: new Date(),
});

@Injectable()
export class UpdateBusinessAppearanceUseCaseImpl implements UpdateBusinessAppearanceUseCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: BusinessRepository,
  ) {}

  async execute(
    command: UpdateBusinessAppearanceCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>> {
    const findResult = await this.businessRepository.findById(command.id);

    if (!findResult.ok) return err(findResult.error as InfrastructureError);

    const business = findResult.value;

    if (!business) return err(BUSINESS_NOT_FOUND(command.id));

    const updated = business.updateAppearance({
      brandColor: command.brandColor,
      brandButtonShape: command.brandButtonShape,
      theme: command.theme,
      gallaryPhotosUrls: command.gallaryPhotosUrls,
      updatedBy: business.ownerId,
    });

    const updateResult = await this.businessRepository.update(updated);

    // buiness already exsists not needed here hence type casting
    if (!updateResult.ok)
      return err(
        updateResult.error as BusinessNotFoundError | InfrastructureError,
      );

    return ok(updated);
  }
}
