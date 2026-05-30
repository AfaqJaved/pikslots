import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business } from '../business.entity';
import type { BrandButtonShape, BrandTheme } from '../types/';

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
