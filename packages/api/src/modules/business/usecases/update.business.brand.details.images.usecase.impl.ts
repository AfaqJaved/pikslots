import { Inject, Injectable } from '@nestjs/common';
import {
  IBusinessRepository,
  InfrastructureError,
  Result,
  err,
  ok,
} from '@pikslots/domain';
import type {
  BusinessNotFoundError,
  BusinessRepository,
  UpdateBusinessBrandDetailsImagesUseCase,
  UpdateBusinessBrandDetailsImagesCommand,
  UpdateBusinessBrandDetailsImagesResult,
} from '@pikslots/domain';
import {
  IPikslotS3Service,
  type PikslotS3Service,
} from 'src/shared/s3/s3.service';

const BUSINESS_NOT_FOUND = (id: string): BusinessNotFoundError => ({
  kind: 'business_not_found',
  by: 'id',
  value: id,
  message: `Business not found against ${id}`,
  timestamp: new Date(),
});

@Injectable()
export class UpdateBusinessBrandDetailsImagesUseCaseImpl implements UpdateBusinessBrandDetailsImagesUseCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: BusinessRepository,
    @Inject(IPikslotS3Service)
    private readonly s3Service: PikslotS3Service,
  ) {}

  async execute(
    command: UpdateBusinessBrandDetailsImagesCommand,
  ): Promise<
    Result<
      UpdateBusinessBrandDetailsImagesResult,
      BusinessNotFoundError | InfrastructureError
    >
  > {
    const findResult = await this.businessRepository.findById(
      command.businessId,
    );

    if (!findResult.ok) {
      return err(findResult.error as InfrastructureError);
    }

    const business = findResult.value;
    if (!business) {
      return err(BUSINESS_NOT_FOUND(command.businessId));
    }

    const oldBannerImage = business.brandDetail.bannerImageUrl;
    const oldBrandLogo = business.brandDetail.brandLogoUrl;

    const updated = business.updateBrandDetailImageUrls({
      brandImageUrl:
        command.bannerImageKey.length > 0
          ? command.bannerImageKey
          : oldBannerImage,
      brandLogoUrl:
        command.brandLogoKey.length > 0 ? command.brandLogoKey : oldBrandLogo,
    });

    const updateResult = await this.businessRepository.update(updated);

    if (!updateResult.ok) {
      return err(
        updateResult.error as BusinessNotFoundError | InfrastructureError,
      );
    }

    if (
      oldBannerImage &&
      command.bannerImageKey.length > 0 &&
      command.bannerImageKey !== oldBannerImage
    ) {
      try {
        await this.s3Service.deleteFile(oldBannerImage);
      } catch (e) {
        // log, but don't fail the use case over a cleanup failure
        return err<InfrastructureError>({
          kind: 'infrastructure',
          message: `Failed to delete old banner image ${oldBannerImage}`,
          cause: e,
          timestamp: new Date(),
        });
      }
    }

    if (
      oldBrandLogo &&
      command.brandLogoKey.length > 0 &&
      command.brandLogoKey !== oldBrandLogo
    ) {
      try {
        await this.s3Service.deleteFile(oldBrandLogo);
      } catch (e) {
        // log, but don't fail the use case over a cleanup failure
        return err<InfrastructureError>({
          kind: 'infrastructure',
          message: `Failed to delete old banner image ${oldBrandLogo}`,
          cause: e,
          timestamp: new Date(),
        });
      }
    }

    return ok({
      business: updated,
      oldBannerImageUrl: oldBannerImage,
      oldBrandLogoUrl: oldBrandLogo,
    });
  }
}
