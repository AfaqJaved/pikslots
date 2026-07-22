import { Test, TestingModule } from '@nestjs/testing';
import {
  Business,
  BusinessNotFoundError,
  err,
  IBusinessRepository,
  InfrastructureError,
  UpdateBusinessBrandDetailsImagesCommand,
} from '@pikslots/domain';
import { BusinessRepositoryTestImpl } from '../repository/business.repository.fake.impl';
import {
  IPikslotS3Service,
  type PikslotS3Service,
} from 'src/shared/s3/s3.service';
import { UpdateBusinessBrandDetailsImagesUseCaseImpl } from './update.business.brand.details.images.usecase.impl';
import { BUSINESS_TEST_DATA } from '../repository/business.fake.data';

function buildCommand(
  overrides: Partial<UpdateBusinessBrandDetailsImagesCommand> = {},
): UpdateBusinessBrandDetailsImagesCommand {
  return {
    businessId: 'business-1',
    bannerImageKey: 'https://cdn.example.com/business-1/new-banner.jpg',
    brandLogoKey: 'https://cdn.example.com/business-1/new-logo.jpg',
    ...overrides,
  } as UpdateBusinessBrandDetailsImagesCommand;
}

describe('UpdateBusinessBrandDetailsImagesUseCaseImpl', () => {
  let useCase: UpdateBusinessBrandDetailsImagesUseCaseImpl;
  let repository: BusinessRepositoryTestImpl;
  let s3Service: jest.Mocked<PikslotS3Service>;
  let originalData: Business[];

  beforeEach(async () => {
    if (!originalData) originalData = [...BUSINESS_TEST_DATA];
    BUSINESS_TEST_DATA.length = 0;
    BUSINESS_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBusinessBrandDetailsImagesUseCaseImpl,
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

    useCase = moduleRef.get(UpdateBusinessBrandDetailsImagesUseCaseImpl);
    repository = moduleRef.get(IBusinessRepository);
    s3Service = moduleRef.get(IPikslotS3Service);
  });

  describe('not found', () => {
    it('returns business_not_found when the business does not exist', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ businessId: 'non-existent-business' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BusinessNotFoundError).kind).toBe(
          'business_not_found',
        );
      }
      expect(updateSpy).not.toHaveBeenCalled();
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

    it('propagates an InfrastructureError from update, without attempting S3 cleanup', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to update business',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'update').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('conditional S3 cleanup', () => {
    it('deletes both old images when both new keys differ from the old ones', async () => {
      // business-1's fixture has both bannerImageUrl and brandLogoUrl set
      const command = buildCommand({
        businessId: 'business-1',
        bannerImageKey: 'https://cdn.example.com/business-1/new-banner.jpg',
        brandLogoKey: 'https://cdn.example.com/business-1/new-logo.jpg',
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).toHaveBeenCalledTimes(2);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(
        'https://cdn.example.com/business-1/banner.jpg',
      );
      expect(s3Service.deleteFile).toHaveBeenCalledWith(
        'https://cdn.example.com/business-1/logo.jpg',
      );
    });

    it('does not delete anything when both keys are empty (no change requested)', async () => {
      const result = await useCase.execute(
        buildCommand({
          businessId: 'business-1',
          bannerImageKey: '',
          brandLogoKey: '',
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).not.toHaveBeenCalled();

      // Falls back to the existing urls when no new key was provided
      if (result.ok) {
        expect(result.value.business.brandDetail.bannerImageUrl).toBe(
          'https://cdn.example.com/business-1/banner.jpg',
        );
        expect(result.value.business.brandDetail.brandLogoUrl).toBe(
          'https://cdn.example.com/business-1/logo.jpg',
        );
      }
    });

    it('does not delete the old banner when the new key is identical to the old one', async () => {
      const result = await useCase.execute(
        buildCommand({
          businessId: 'business-1',
          bannerImageKey: 'https://cdn.example.com/business-1/banner.jpg', // same as fixture
          brandLogoKey: '',
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('only deletes the banner when only the banner key changes', async () => {
      const result = await useCase.execute(
        buildCommand({
          businessId: 'business-1',
          bannerImageKey: 'https://cdn.example.com/business-1/new-banner.jpg',
          brandLogoKey: '',
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).toHaveBeenCalledTimes(1);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(
        'https://cdn.example.com/business-1/banner.jpg',
      );
    });

    it('only deletes the logo when only the logo key changes', async () => {
      const result = await useCase.execute(
        buildCommand({
          businessId: 'business-1',
          bannerImageKey: '',
          brandLogoKey: 'https://cdn.example.com/business-1/new-logo.jpg',
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).toHaveBeenCalledTimes(1);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(
        'https://cdn.example.com/business-1/logo.jpg',
      );
    });

    it('does not attempt to delete when there was no old image to begin with', async () => {
      // business-2's fixture has empty bannerImageUrl/brandLogoUrl
      // (Business.create()'s default)
      const result = await useCase.execute(
        buildCommand({
          businessId: 'business-2',
          bannerImageKey: 'https://cdn.example.com/business-2/banner.jpg',
          brandLogoKey: 'https://cdn.example.com/business-2/logo.jpg',
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('S3 cleanup failure contradicts its own comment', () => {
    // NOTE: both catch blocks are commented "log, but don't fail the use
    // case over a cleanup failure," but the code immediately does
    // `return err(...)`, which DOES fail the use case. By this point the
    // business record has already been successfully saved via
    // businessRepository.update() -- so the caller receives a failure
    // result even though the actual mutation succeeded. This test
    // documents that real (and likely unintended) behavior.
    it('returns an InfrastructureError when S3 deletion fails, despite the business already being saved', async () => {
      s3Service.deleteFile.mockRejectedValueOnce(new Error('S3 unreachable'));

      const result = await useCase.execute(
        buildCommand({
          businessId: 'business-1',
          bannerImageKey: 'https://cdn.example.com/business-1/new-banner.jpg',
          brandLogoKey: '',
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as InfrastructureError).kind).toBe(
          'infrastructure',
        );
      }

      // ...yet the business WAS already updated in the repository.
      const persisted = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');
      expect(persisted?.brandDetail.bannerImageUrl).toBe(
        'https://cdn.example.com/business-1/new-banner.jpg',
      );
    });
  });

  describe('successful update', () => {
    it('returns the updated business plus the old image urls', async () => {
      const command = buildCommand({
        businessId: 'business-1',
        bannerImageKey: 'https://cdn.example.com/business-1/new-banner.jpg',
        brandLogoKey: 'https://cdn.example.com/business-1/new-logo.jpg',
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.business.brandDetail.bannerImageUrl).toBe(
          command.bannerImageKey,
        );
        expect(result.value.business.brandDetail.brandLogoUrl).toBe(
          command.brandLogoKey,
        );
        expect(result.value.oldBannerImageUrl).toBe(
          'https://cdn.example.com/business-1/banner.jpg',
        );
        expect(result.value.oldBrandLogoUrl).toBe(
          'https://cdn.example.com/business-1/logo.jpg',
        );
      }
    });

    // Business.updateBrandDetailImageUrls() does not touch updatedAt or
    // updatedBy at all (unlike every other Business.updateX method), so
    // this mutation leaves the audit trail unchanged.
    it('does not change updatedAt or updatedBy, since the entity method does not set them', async () => {
      const before = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');

      const result = await useCase.execute(
        buildCommand({ businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.business.updatedAt).toEqual(before?.updatedAt);
        expect(result.value.business.updatedBy).toBe(before?.updatedBy);
      }
    });
  });
});
