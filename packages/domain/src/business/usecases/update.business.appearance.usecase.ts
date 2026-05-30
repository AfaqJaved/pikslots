import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business, BrandButtonShape, BrandTheme } from '../business.entity';

export interface UpdateBusinessAppearanceCommand {
  id: string;
  brandColor: string;
  brandButtonShape: BrandButtonShape;
  theme: BrandTheme;
  gallaryPhotosUrls: string[];
}

export const IUpdateBusinessAppearanceUseCase = Symbol('IUpdateBusinessAppearanceUseCase');

export interface UpdateBusinessAppearanceUseCase {
  execute(
    command: UpdateBusinessAppearanceCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>>;
}
