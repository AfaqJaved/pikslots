import { Test, TestingModule } from '@nestjs/testing';
import {
  Business,
  BusinessNotFoundError,
  err,
  IBusinessRepository,
  InfrastructureError,
  UpdateBusinessGalleryPhotosCommand,
} from '@pikslots/domain';
import { BusinessRepositoryTestImpl } from '../repository/business.repository.fake.impl';
import {
  IPikslotS3Service,
  type PikslotS3Service,
} from 'src/shared/s3/s3.service';
import { UpdateBusinessGalleryPhotosUseCaseImpl } from './update.business.gallery.photos.usecase.impl';
import { BUSINESS_TEST_DATA } from '../repository/business.fake.data';

const OLD_PHOTO_1 = 'https://cdn.example.com/business-1/gallery-1.jpg';
const OLD_PHOTO_2 = 'https://cdn.example.com/business-1/gallery-2.jpg';

function buildCommand(
  overrides: Partial<UpdateBusinessGalleryPhotosCommand> = {},
): UpdateBusinessGalleryPhotosCommand {
  return {
    id: 'business-1',
    galleryPhotosKeys: [OLD_PHOTO_1, OLD_PHOTO_2],
    ...overrides,
  } as UpdateBusinessGalleryPhotosCommand;
}

describe('UpdateBusinessGalleryPhotosUseCaseImpl', () => {
  let useCase: UpdateBusinessGalleryPhotosUseCaseImpl;
  let repository: BusinessRepositoryTestImpl;
  let s3Service: jest.Mocked<PikslotS3Service>;
  let originalData: Business[];

  beforeEach(async () => {
    if (!originalData) originalData = [...BUSINESS_TEST_DATA];
    BUSINESS_TEST_DATA.length = 0;
    BUSINESS_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBusinessGalleryPhotosUseCaseImpl,
        {
          provide: IBusinessRepository,
          useClass: BusinessRepositoryTestImpl,
        },
        {
          provide: IPikslotS3Service,
          useValue: { deleteFile: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    useCase = moduleRef.get(UpdateBusinessGalleryPhotosUseCaseImpl);
    repository = moduleRef.get(IBusinessRepository);
    s3Service = moduleRef.get(IPikslotS3Service);
  });

  // Same gap as UpdateBusinessAppearanceUseCaseImpl / BrandDetails: no
  // SecurityContext dependency at all, so there is no role or ownership
  // check whatsoever on this write path.

  describe('not found', () => {
    it('returns business_not_found when the business does not exist', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ id: 'non-existent-business' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BusinessNotFoundError).kind).toBe(
          'business_not_found',
        );
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from findById', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'DB unreachable',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from update, without attempting any S3 cleanup', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to update business',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'update').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(
        buildCommand({ id: 'business-1', galleryPhotosKeys: [] }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('gallery diffing for S3 cleanup', () => {
    it('deletes both old photos when the new list replaces them entirely', async () => {
      const result = await useCase.execute(
        buildCommand({
          id: 'business-1',
          galleryPhotosKeys: [
            'https://cdn.example.com/business-1/gallery-3.jpg',
            'https://cdn.example.com/business-1/gallery-4.jpg',
          ],
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).toHaveBeenCalledTimes(2);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(OLD_PHOTO_1);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(OLD_PHOTO_2);
    });

    it('deletes nothing when photos are only added, not removed', async () => {
      const result = await useCase.execute(
        buildCommand({
          id: 'business-1',
          galleryPhotosKeys: [
            OLD_PHOTO_1,
            OLD_PHOTO_2,
            'https://cdn.example.com/business-1/gallery-3.jpg',
          ],
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('deletes only the specific photo that was removed', async () => {
      const result = await useCase.execute(
        buildCommand({ id: 'business-1', galleryPhotosKeys: [OLD_PHOTO_1] }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).toHaveBeenCalledTimes(1);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(OLD_PHOTO_2);
    });

    it('deletes all old photos when the gallery is cleared entirely', async () => {
      const result = await useCase.execute(
        buildCommand({ id: 'business-1', galleryPhotosKeys: [] }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).toHaveBeenCalledTimes(2);
    });

    it('deletes nothing when the same photos are only reordered', async () => {
      const result = await useCase.execute(
        buildCommand({
          id: 'business-1',
          galleryPhotosKeys: [OLD_PHOTO_2, OLD_PHOTO_1],
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('handles simultaneous add and remove, deleting only the removed one', async () => {
      const result = await useCase.execute(
        buildCommand({
          id: 'business-1',
          galleryPhotosKeys: [
            OLD_PHOTO_1, // kept
            'https://cdn.example.com/business-1/gallery-3.jpg', // added
          ],
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).toHaveBeenCalledTimes(1);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(OLD_PHOTO_2);
    });
  });

  describe('S3 cleanup failure tolerance', () => {
    // In contrast to UpdateBusinessBrandDetailsImagesUseCaseImpl (which
    // claims cleanup failures won't fail the use case but actually does
    // fail it), this use case genuinely tolerates cleanup failures because
    // it uses Promise.allSettled rather than propagating a rejection.
    it('still succeeds even if one of the S3 deletions rejects', async () => {
      s3Service.deleteFile.mockImplementation((key: string) =>
        key === OLD_PHOTO_1
          ? Promise.reject(new Error('S3 unreachable'))
          : Promise.resolve(),
      );

      const result = await useCase.execute(
        buildCommand({ id: 'business-1', galleryPhotosKeys: [] }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('successful update', () => {
    it('updates gallaryPhotosUrls and returns the updated entity', async () => {
      const newPhotos = [
        'https://cdn.example.com/business-1/gallery-3.jpg',
        'https://cdn.example.com/business-1/gallery-4.jpg',
      ];

      const result = await useCase.execute(
        buildCommand({ id: 'business-1', galleryPhotosKeys: newPhotos }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.brandApperanceDetails.gallaryPhotosUrls).toEqual(
          newPhotos,
        );
      }
    });

    // Business.updateGalleryPhotos() does not touch updatedAt/updatedBy at
    // all, same as updateBrandDetailImageUrls -- unlike most other
    // Business.updateX methods.
    it('does not change updatedAt or updatedBy, since the entity method does not set them', async () => {
      const before = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');

      const result = await useCase.execute(
        buildCommand({ id: 'business-1', galleryPhotosKeys: [] }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.updatedAt).toEqual(before?.updatedAt);
        expect(result.value.updatedBy).toBe(before?.updatedBy);
      }
    });

    it('preserves other brandApperanceDetails fields, like brandColor and theme', async () => {
      const before = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');

      const result = await useCase.execute(
        buildCommand({ id: 'business-1', galleryPhotosKeys: [] }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.brandApperanceDetails.brandColor).toBe(
          before?.brandApperanceDetails.brandColor,
        );
        expect(result.value.brandApperanceDetails.theme).toBe(
          before?.brandApperanceDetails.theme,
        );
      }
    });
  });
});
