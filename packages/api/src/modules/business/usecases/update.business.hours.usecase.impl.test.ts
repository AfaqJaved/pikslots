import { Test, TestingModule } from '@nestjs/testing';
import {
  Business,
  BusinessNotFoundError,
  err,
  IBusinessRepository,
  InfrastructureError,
  UpdateBusinessHoursCommand,
} from '@pikslots/domain';
import { UpdateBusinessHoursUseCaseImpl } from './update.business.hours.usecase.impl';
import { BusinessRepositoryTestImpl } from '../repository/business.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { BUSINESS_TEST_DATA } from '../repository/business.fake.data';

const NEW_HOURS = {
  monday: { enabled: true, openTime: '08:00', closeTime: '18:00' },
  tuesday: { enabled: true, openTime: '08:00', closeTime: '18:00' },
  wednesday: { enabled: false, openTime: '08:00', closeTime: '18:00' },
  thursday: { enabled: true, openTime: '08:00', closeTime: '18:00' },
  friday: { enabled: true, openTime: '08:00', closeTime: '20:00' },
  saturday: { enabled: true, openTime: '10:00', closeTime: '14:00' },
  sunday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
};

function buildCommand(
  overrides: Partial<UpdateBusinessHoursCommand> = {},
): UpdateBusinessHoursCommand {
  return {
    id: 'business-1',
    businessHours: NEW_HOURS,
    ...overrides,
  } as UpdateBusinessHoursCommand;
}

describe('UpdateBusinessHoursUseCaseImpl', () => {
  let useCase: UpdateBusinessHoursUseCaseImpl;
  let repository: BusinessRepositoryTestImpl;
  let securityContext: SecurityContext;
  let originalData: Business[];

  beforeEach(async () => {
    if (!originalData) originalData = [...BUSINESS_TEST_DATA];
    BUSINESS_TEST_DATA.length = 0;
    BUSINESS_TEST_DATA.push(...originalData);

    securityContext = {
      userId: 'user-business-owner-1',
      role: 'Business Owner',
      businessId: 'business-1',
    } as SecurityContext;

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBusinessHoursUseCaseImpl,
        {
          provide: IBusinessRepository,
          useClass: BusinessRepositoryTestImpl,
        },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(UpdateBusinessHoursUseCaseImpl);
    repository = moduleRef.get(IBusinessRepository);
  });

  describe('missing authorization check', () => {
    it('allows an unrelated caller (different business, non-owner role) to edit business hours', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-999', // completely unrelated to business-1
      });

      const result = await useCase.execute(buildCommand({ id: 'business-1' }));

      expect(result.ok).toBe(true);
    });
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
    it('replaces businessHours wholesale and returns the updated entity', async () => {
      const result = await useCase.execute(
        buildCommand({ id: 'business-1', businessHours: NEW_HOURS }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.businessHours).toEqual(NEW_HOURS);
      }
    });

    it('correctly reflects a day being disabled', async () => {
      const result = await useCase.execute(
        buildCommand({ id: 'business-1', businessHours: NEW_HOURS }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.businessHours.wednesday.enabled).toBe(false);
        expect(result.value.businessHours.saturday.enabled).toBe(true);
      }
    });

    it('sets updatedBy to the calling SecurityContext userId', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      await useCase.execute(buildCommand({ id: 'business-1' }));

      const [savedArg] = updateSpy.mock.calls[0];
      expect(savedArg.updatedBy).toBe('user-business-owner-1');
    });

    it('preserves unrelated fields, like name, slug, and locationDetails', async () => {
      const before = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');

      await useCase.execute(buildCommand({ id: 'business-1' }));

      const after = BUSINESS_TEST_DATA.find((b) => b.id === 'business-1');
      expect(after?.name).toBe(before?.name);
      expect(after?.slug).toBe(before?.slug);
      expect(after?.locationDetails).toEqual(before?.locationDetails);
    });
  });
});
