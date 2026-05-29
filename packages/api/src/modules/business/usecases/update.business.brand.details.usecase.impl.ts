import { Inject, Injectable } from '@nestjs/common';
import {
  Business,
  BusinessAlreadyExistsError,
  IBusinessRepository,
  InfrastructureError,
  Result,
  err,
  ok,
} from '@pikslots/domain';
import type {
  BusinessNotFoundError,
  BusinessRepository,
  UpdateBusinessBrandDetailsCommand,
  UpdateBusinessBrandDetailsUseCase,
} from '@pikslots/domain';

const BUSINESS_NOT_FOUND = (id: string): BusinessNotFoundError => ({
  kind: 'business_not_found',
  by: 'id',
  value: `Business not found against ${id}`,
  message: `Business not found against ${id}`,
  timestamp: new Date(),
});

@Injectable()
export class UpdateBusinessBrandDetailsUseCaseImpl implements UpdateBusinessBrandDetailsUseCase {
  constructor(
    @Inject(IBusinessRepository)
    private readonly businessRepository: BusinessRepository,
  ) {}

  async execute(
    command: UpdateBusinessBrandDetailsCommand,
  ): Promise<
    Result<
      Business,
      BusinessNotFoundError | BusinessAlreadyExistsError | InfrastructureError
    >
  > {
    const findResult = await this.businessRepository.findById(command.id);

    if (!findResult.ok) {
      return err(findResult.error as InfrastructureError);
    }

    const business = findResult.value;

    if (!business) return err(BUSINESS_NOT_FOUND(command.id));

    if (command.slug !== business.slug) {
      const slugCollision = await this.checkSlugAlreadyExsists(command.slug);
      if (slugCollision) return err(slugCollision);
    }

    const updated = business.updateBrandDetails({
      bannerImageUrl: command.bannerImageUrl,
      logoUrl: command.logoUrl,
      name: command.name,
      slug: command.slug,
      industry: command.industry,
      about: command.about,
      updatedBy: business.ownerId,
    });

    const saveResult = await this.businessRepository.save(updated);

    if (!saveResult.ok) return err(saveResult.error);

    return ok(updated);
  }

  private async checkSlugAlreadyExsists(
    slug: string,
  ): Promise<BusinessAlreadyExistsError | InfrastructureError | null> {
    const result = await this.businessRepository.existsBySlug(slug);

    if (!result.ok) return result.error;

    if (result.value) {
      return {
        kind: 'business_already_exists',
        message: `Slug "${slug}" is already taken`,
        timestamp: new Date(),
        field: 'slug',
      } satisfies BusinessAlreadyExistsError;
    }

    return null;
  }
}
