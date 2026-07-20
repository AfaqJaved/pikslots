import { Test, TestingModule } from '@nestjs/testing';
import {
  Business,
  BusinessNotFoundError,
  err,
  IBusinessRepository,
  InfrastructureError,
  UpdateBusinessAppearanceCommand,
} from '@pikslots/domain';
import { UpdateBusinessAppearanceUseCaseImpl } from './update.business.appearance.usecase.impl';
import { BusinessRepositoryTestImpl } from '../repositroy/business.repository.impl';
import { BUSINESS_TEST_DATA } from '../repositroy/business.fake.data';

function buildCommand(
  overrides: Partial<UpdateBusinessAppearanceCommand> = {},
): UpdateBusinessAppearanceCommand {
  return {
    id: 'business-1',
    brandColor: '#3A86FF',
    brandButtonShape: 'pill',
    theme: 'dark',
    gallaryPhotosUrls: [
      'https://cdn.example.com/business-1/new-gallery-1.jpg',
      'https://cdn.example.com/business-1/new-gallery-2.jpg',
    ],
    ...overrides,
  } as UpdateBusinessAppearanceCommand;
}

describe('UpdateBusinessAppearanceUseCaseImpl', () => {
  let useCase: UpdateBusinessAppearanceUseCaseImpl;
  let repository: BusinessRepositoryTestImpl;
  let originalData: Business[];

  beforeEach(async () => {
    if (!originalData) originalData = [...BUSINESS_TEST_DATA];
    BUSINESS_TEST_DATA.length = 0;
    BUSINESS_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBusinessAppearanceUseCaseImpl,
        {
          provide: IBusinessRepository,
          useClass: BusinessRepositoryTestImpl,
        },
      ],
    }).compile();

    useCase = moduleRef.get(UpdateBusinessAppearanceUseCaseImpl);
    repository = moduleRef.get(IBusinessRepository);
  });

  // NOTE: this use case has no SecurityContext dependency at all -- unlike
  // every other write operation in this codebase (edit customer, edit
  // class, edit service, etc.), there is no role check and no ownership
  // check whatsoever. Any caller who knows a business id can overwrite its
  // branding. This is a write path, not a read-only listing, so the
  // "missing authorization" concern here is more significant than the
  // similar gap flagged on FindAllClassesByBusinessUseCaseImpl /
  // FindAllServicesByBusinessUseCaseImpl / FindAllRegisteredBusinessesUseCaseImpl.
  // Worth confirming whether a guard is meant to sit in front of this at
  // the controller level, or whether this needs a SecurityContext +
  // Business.canEditX-style check added directly.

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
    });

    it('treats a soft-deleted business as not found', async () => {
      const result = await useCase.execute(
        buildCommand({ id: 'business-deleted-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BusinessNotFoundError).kind).toBe(
          'business_not_found',
        );
      }
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
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from update', async () => {
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
    });

    it('propagates a BusinessNotFoundError raised by update itself', async () => {
      const notFoundError: BusinessNotFoundError = {
        kind: 'business_not_found',
        by: 'id',
        value: 'business-1',
        message: 'Business not found',
        timestamp: new Date(),
      };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValueOnce(err(notFoundError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BusinessNotFoundError).kind).toBe(
          'business_not_found',
        );
      }
    });
  });

  describe('successful update', () => {
    it('updates the appearance fields and returns the updated entity', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const command = buildCommand({
        id: 'business-1',
        brandColor: '#3A86FF',
        brandButtonShape: 'pill',
        theme: 'dark',
        gallaryPhotosUrls: ['https://cdn.example.com/business-1/new-1.jpg'],
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.brandApperanceDetails).toEqual({
          brandColor: command.brandColor,
          brandButtonShape: command.brandButtonShape,
          theme: command.theme,
          gallaryPhotosUrls: command.gallaryPhotosUrls,
        });
      }

      expect(updateSpy).toHaveBeenCalledTimes(1);
      const [savedArg] = updateSpy.mock.calls[0];
      expect(savedArg.id).toBe('business-1');
      // updatedBy is set to the business's own ownerId, since there is no
      // caller identity available to this use case.
      expect(savedArg.updatedBy).toBe(savedArg.ownerId);

      const persisted = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');
      expect(persisted?.brandApperanceDetails.brandColor).toBe(
        command.brandColor,
      );
    });

    it('preserves fields not related to appearance, like name and slug', async () => {
      const before = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');

      await useCase.execute(buildCommand({ id: 'business-1' }));

      const after = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');
      expect(after?.name).toBe(before?.name);
      expect(after?.slug).toBe(before?.slug);
      expect(after?.status).toBe(before?.status);
      expect(after?.ownerId).toBe(before?.ownerId);
    });
  });
});
