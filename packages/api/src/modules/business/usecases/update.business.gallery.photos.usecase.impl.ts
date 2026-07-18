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
  UpdateBusinessGalleryPhotosCommand,
  UpdateBusinessGalleryPhotosUseCase,
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
export class UpdateBusinessGalleryPhotosUseCaseImpl implements UpdateBusinessGalleryPhotosUseCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: BusinessRepository,
    @Inject(IPikslotS3Service)
    private readonly s3Service: PikslotS3Service,
  ) {}

  async execute(
    command: UpdateBusinessGalleryPhotosCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>> {
    const findResult = await this.businessRepository.findById(command.id);

    if (!findResult.ok) return err(findResult.error as InfrastructureError);

    const business = findResult.value;

    if (!business) return err(BUSINESS_NOT_FOUND(command.id));

    const oldGalleryPhotos = business.brandApperanceDetails.gallaryPhotosUrls;

    const updated = business.updateGalleryPhotos(command.galleryPhotosKeys);
    const updateResult = await this.businessRepository.update(updated);

    if (!updateResult.ok) return err(updateResult.error as InfrastructureError);

    const keysToDelete = oldGalleryPhotos.filter(
      (key) => !command.galleryPhotosKeys.includes(key),
    );

    await Promise.allSettled(
      keysToDelete.map((key) => this.s3Service.deleteFile(key)),
    );

    return ok(updated);
  }
}
