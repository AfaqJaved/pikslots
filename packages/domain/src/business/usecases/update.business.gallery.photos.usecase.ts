import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business } from '../business.entity';

export interface UpdateBusinessGalleryPhotosCommand {
  id: string;
  galleryPhotosKeys: string[];
}

export const IUpdateBusinessGalleryPhotosUseCase = Symbol('IUpdateBusinessGalleryPhotosUseCase');

export interface UpdateBusinessGalleryPhotosUseCase {
  execute(
    command: UpdateBusinessGalleryPhotosCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>>;
}
