import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business } from '../business.entity';

export interface UpdateBusinessBrandDetailsImagesCommand {
  businessId: string;
  bannerImageKey: string;
  brandLogoKey: string;
}

export const IUpdateBusinessBrandDetilsImagesUseCase = Symbol(
  'IUpdateBusinessBrandDetailsImagesUseCase',
);

export interface UpdateBusinessBrandDetailsImagesResult {
  business: Business;
  oldBannerImageUrl: string | null;
  oldBrandLogoUrl: string | null;
}

export interface UpdateBusinessBrandDetailsImagesUseCase {
  execute(
    command: UpdateBusinessBrandDetailsImagesCommand,
  ): Promise<
    Result<
      UpdateBusinessBrandDetailsImagesResult,
      BusinessNotFoundError | InfrastructureError
    >
  >;
}
