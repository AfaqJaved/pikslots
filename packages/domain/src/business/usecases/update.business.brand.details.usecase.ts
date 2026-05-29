import type { InfrastructureError, Result } from '../../shared';
import type { BusinessAlreadyExistsError, BusinessNotFoundError } from '../errors';
import type { Business, BusinessIndustry } from '../business.entity';

export interface UpdateBusinessBrandDetailsCommand {
  id: string;
  bannerImageUrl: string;
  logoUrl: string;
  name: string;
  slug: string;
  industry: BusinessIndustry;
  about: string;
}

export const IUpdateBusinessBrandDetailsUseCase = Symbol('IUpdateBusinessBrandDetailsUseCase');

export interface UpdateBusinessBrandDetailsUseCase {
  execute(
    command: UpdateBusinessBrandDetailsCommand,
  ): Promise<
    Result<Business, BusinessNotFoundError | BusinessAlreadyExistsError | InfrastructureError>
  >;
}
