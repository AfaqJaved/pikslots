import { Test, TestingModule } from '@nestjs/testing';
import {
  Business,
  BusinessNotFoundError,
  err,
  IBusinessRepository,
  InfrastructureError,
  UpdateBusinessGeneralCommand,
} from '@pikslots/domain';
import { UpdateBusinessGeneralUseCaseImpl } from './update.business.general.usecase.impl';
import { BusinessRepositoryTestImpl } from '../repository/business.repository.fake.impl';
import { BUSINESS_TEST_DATA } from '../repository/business.fake.data';

function buildCommand(
  overrides: Partial<UpdateBusinessGeneralCommand> = {},
): UpdateBusinessGeneralCommand {
  return {
    id: 'business-1',
    language: 'fr',
    ...overrides,
  } as UpdateBusinessGeneralCommand;
}

describe('UpdateBusinessGeneralUseCaseImpl', () => {
  let useCase: UpdateBusinessGeneralUseCaseImpl;
  let repository: BusinessRepositoryTestImpl;
  let originalData: Business[];

  beforeEach(async () => {
    if (!originalData) originalData = [...BUSINESS_TEST_DATA];
    BUSINESS_TEST_DATA.length = 0;
    BUSINESS_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBusinessGeneralUseCaseImpl,
        {
          provide: IBusinessRepository,
          useClass: BusinessRepositoryTestImpl,
        },
      ],
    }).compile();

    useCase = moduleRef.get(UpdateBusinessGeneralUseCaseImpl);
    repository = moduleRef.get(IBusinessRepository);
  });

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
        expect((result.error as BusinessNotFoundError).value).toBe(
          'non-existent-business',
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
    it('updates locationDetails.language and returns the updated entity', async () => {
      const result = await useCase.execute(
        buildCommand({ id: 'business-1', language: 'fr' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.locationDetails.language).toBe('fr');
      }
    });

    it('sets updatedBy to the business owner, since there is no caller identity available', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      await useCase.execute(buildCommand({ id: 'business-1' }));

      const [savedArg] = updateSpy.mock.calls[0];
      expect(savedArg.updatedBy).toBe(savedArg.ownerId);
      expect(savedArg.updatedBy).toBe('user-business-owner-1');
    });

    it('bumps updatedAt', async () => {
      const before = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');

      const result = await useCase.execute(buildCommand({ id: 'business-1' }));

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(
          before!.updatedAt.getTime(),
        );
      }
    });

    it('preserves the rest of locationDetails, like currency, timeZone, and address', async () => {
      const before = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');

      const result = await useCase.execute(
        buildCommand({ id: 'business-1', language: 'de' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.locationDetails.currency).toBe(
          before?.locationDetails.currency,
        );
        expect(result.value.locationDetails.timeZone).toBe(
          before?.locationDetails.timeZone,
        );
        expect(result.value.locationDetails.address).toBe(
          before?.locationDetails.address,
        );
        expect(result.value.locationDetails.city).toBe(
          before?.locationDetails.city,
        );
      }
    });

    it('preserves unrelated top-level fields, like name, slug, and businessHours', async () => {
      const before = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');

      await useCase.execute(buildCommand({ id: 'business-1' }));

      const after = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');
      expect(after?.name).toBe(before?.name);
      expect(after?.slug).toBe(before?.slug);
      expect(after?.businessHours).toEqual(before?.businessHours);
    });
  });
});
