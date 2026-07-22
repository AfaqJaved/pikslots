import { Test, TestingModule } from '@nestjs/testing';
import {
  Business,
  BusinessAlreadyExistsError,
  BusinessNotFoundError,
  err,
  IBusinessRepository,
  InfrastructureError,
  UpdateBusinessBrandDetailsCommand,
} from '@pikslots/domain';
import { BusinessRepositoryTestImpl } from '../repository/business.repository.fake.impl';
import { UpdateBusinessBrandDetailsUseCaseImpl } from './update.business.brand.details.usecase.impl';
import { BUSINESS_TEST_DATA } from '../repository/business.fake.data';

function buildCommand(
  overrides: Partial<UpdateBusinessBrandDetailsCommand> = {},
): UpdateBusinessBrandDetailsCommand {
  return {
    id: 'business-1',
    bannerImageUrl: 'https://cdn.example.com/business-1/new-banner.jpg',
    logoUrl: 'https://cdn.example.com/business-1/new-logo.jpg',
    name: "Alice's Salon & Spa (Updated)",
    slug: 'alices-salon-and-spa', // unchanged by default
    industry: 'salon_and_beauty',
    about: 'Updated about text.',
    ...overrides,
  } as UpdateBusinessBrandDetailsCommand;
}

describe('UpdateBusinessBrandDetailsUseCaseImpl', () => {
  let useCase: UpdateBusinessBrandDetailsUseCaseImpl;
  let repository: BusinessRepositoryTestImpl;
  let originalData: Business[];

  beforeEach(async () => {
    if (!originalData) originalData = [...BUSINESS_TEST_DATA];
    BUSINESS_TEST_DATA.length = 0;
    BUSINESS_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBusinessBrandDetailsUseCaseImpl,
        {
          provide: IBusinessRepository,
          useClass: BusinessRepositoryTestImpl,
        },
      ],
    }).compile();

    useCase = moduleRef.get(UpdateBusinessBrandDetailsUseCaseImpl);
    repository = moduleRef.get(IBusinessRepository);
  });

  // Same gap as UpdateBusinessAppearanceUseCaseImpl: no SecurityContext
  // dependency at all, so there is no role or ownership check whatsoever.
  // Any caller who knows a business id can rewrite its name, slug,
  // industry, and about text.

  describe('not found', () => {
    it('returns business_not_found when the business does not exist', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ id: 'non-existent-business' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        // NOTE: BUSINESS_NOT_FOUND's `value` field is set to the message
        // string rather than the actual id -- same bug pattern seen in
        // Class/Service not-found constants. Only asserting on `kind`.
        expect((result.error as BusinessNotFoundError).kind).toBe(
          'business_not_found',
        );
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('treats a soft-deleted business as not found', async () => {
      const result = await useCase.execute(
        buildCommand({ id: 'business-deleted-1', slug: 'closed-retail-shop' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BusinessNotFoundError).kind).toBe(
          'business_not_found',
        );
      }
    });
  });

  describe('slug collision check', () => {
    it('skips the existsBySlug check entirely when the slug is unchanged', async () => {
      const existsBySlugSpy = jest.spyOn(repository, 'existsBySlug');

      const result = await useCase.execute(
        buildCommand({ id: 'business-1', slug: 'alices-salon-and-spa' }),
      );

      expect(result.ok).toBe(true);
      expect(existsBySlugSpy).not.toHaveBeenCalled();
    });

    it('allows changing to a genuinely unique slug', async () => {
      const result = await useCase.execute(
        buildCommand({ id: 'business-1', slug: 'alices-new-slug' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.slug).toBe('alices-new-slug');
      }
    });

    it('rejects changing to a slug already taken by another business', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      // business-2's fixture slug is 'momentum-fitness'
      const result = await useCase.execute(
        buildCommand({ id: 'business-1', slug: 'momentum-fitness' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BusinessAlreadyExistsError).kind).toBe(
          'business_already_exists',
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
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from existsBySlug when the slug changed', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'DB unreachable',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest
        .spyOn(repository, 'existsBySlug')
        .mockResolvedValueOnce(err(infraError));
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ id: 'business-1', slug: 'a-brand-new-slug' }),
      );

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
  });

  describe('successful update', () => {
    it('updates brand details and returns the updated entity', async () => {
      const command = buildCommand({
        id: 'business-1',
        bannerImageUrl: 'https://cdn.example.com/business-1/new-banner.jpg',
        logoUrl: 'https://cdn.example.com/business-1/new-logo.jpg',
        name: "Alice's Salon & Spa (Updated)",
        slug: 'alices-salon-and-spa',
        industry: 'salon_and_beauty',
        about: 'Updated about text.',
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe(command.name);
        expect(result.value.slug).toBe(command.slug);
        expect(result.value.industry).toBe(command.industry);
        expect(result.value.about).toBe(command.about);
        expect(result.value.brandDetail).toEqual({
          bannerImageUrl: command.bannerImageUrl,
          brandLogoUrl: command.logoUrl,
        });
      }
    });

    it('sets updatedBy to the business owner, since there is no caller identity available', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      await useCase.execute(buildCommand({ id: 'business-1' }));

      const [savedArg] = updateSpy.mock.calls[0];
      expect(savedArg.updatedBy).toBe(savedArg.ownerId);
      expect(savedArg.updatedBy).toBe('user-business-owner-1');
    });

    it('bumps updatedAt, unlike updateBrandDetailImageUrls', async () => {
      const before = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');

      const result = await useCase.execute(buildCommand({ id: 'business-1' }));

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(
          before!.updatedAt.getTime(),
        );
      }
    });

    it('preserves unrelated fields, like ownerId and businessHours', async () => {
      const before = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');

      await useCase.execute(buildCommand({ id: 'business-1' }));

      const after = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');
      expect(after?.ownerId).toBe(before?.ownerId);
      expect(after?.businessHours).toEqual(before?.businessHours);
    });
  });
});
