// find.timeoff.by.id.usecase.impl.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  err,
  InfrastructureError,
  ITimeoffRepository,
  TimeOffNotFound,
  UnauthorizedError,
} from '@pikslots/domain';
import { TIMEOFF_TEST_DATA } from '../repository/timeoff.test.data';
import { TimeOffRepositoryTestImpl } from '../repository/timeoff.repository.fake.impl';
import { FindTimeOffByIdUseCaseImpl } from './find.timeoff.by.id.usecase.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';

describe('FindTimeOffByIdUseCaseImpl', () => {
  let useCase: FindTimeOffByIdUseCaseImpl;
  let repository: TimeOffRepositoryTestImpl;
  let securityContext: SecurityContext;
  let originalData: typeof TIMEOFF_TEST_DATA;

  beforeEach(async () => {
    if (!originalData) originalData = [...TIMEOFF_TEST_DATA];
    TIMEOFF_TEST_DATA.length = 0;
    TIMEOFF_TEST_DATA.push(...originalData);

    securityContext = {
      userId: 'user-standard-1',
      role: 'Standard',
      businessId: 'business-1',
    } as SecurityContext;

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindTimeOffByIdUseCaseImpl,
        { provide: ITimeoffRepository, useClass: TimeOffRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(FindTimeOffByIdUseCaseImpl);
    repository = moduleRef.get(ITimeoffRepository);
  });

  describe('authorization', () => {
    it('allows a Platform Owner to view any timeoff regardless of business', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999',
      });

      const result = await useCase.execute('timeoff-1');

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to view a timeoff within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute('timeoff-1'); // business-1

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-2',
      });

      const result = await useCase.execute('timeoff-1'); // business-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('allows an Admin to view a timeoff within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute('timeoff-3'); // user-enhanced-1, business-1

      expect(result.ok).toBe(true);
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-2',
      });

      const result = await useCase.execute('timeoff-3'); // business-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('allows a Standard user to view their own timeoff', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute('timeoff-1'); // owned by user-standard-1

      expect(result.ok).toBe(true);
    });

    it("denies a Standard user viewing someone else's timeoff, even in the same business", async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute('timeoff-3'); // owned by user-enhanced-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('denies a Standard user viewing their own timeoff from a different business context', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-2',
      });

      const result = await useCase.execute('timeoff-1'); // record's businessId is business-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('allows an Enhanced user to view their own timeoff', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute('timeoff-3'); // owned by user-enhanced-1

      expect(result.ok).toBe(true);
    });

    it("denies an Enhanced user viewing someone else's timeoff", async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute('timeoff-1'); // owned by user-standard-1

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });
  });

  describe('not found', () => {
    it('returns TimeOffNotFound when the timeoff does not exist', async () => {
      const result = await useCase.execute('timeoff-nonexistent');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as TimeOffNotFound).kind).toBe(
          'timeoff_not_found',
        );
      }
    });

    it('returns TimeOffNotFound for a soft-deleted timeoff (findById excludes deleted rows)', async () => {
      const result = await useCase.execute('timeoff-4'); // soft-deleted in fixture

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as TimeOffNotFound).kind).toBe(
          'timeoff_not_found',
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

      const result = await useCase.execute('timeoff-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });

    it('propagates a TimeOffNotFound error surfaced directly from findById', async () => {
      const notFoundError: TimeOffNotFound = {
        kind: 'timeoff_not_found',
        message: 'Timeoff not found',
        by: 'id',
        timestamp: new Date(),
        value: 'timeoff-1',
      };
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValueOnce(err(notFoundError));

      const result = await useCase.execute('timeoff-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(notFoundError);
      }
    });
  });

  describe('repository interactions', () => {
    it('calls findById with the given id', async () => {
      const findByIdSpy = jest.spyOn(repository, 'findById');

      await useCase.execute('timeoff-1');

      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdSpy).toHaveBeenCalledWith('timeoff-1');
    });
  });

  describe('successful lookup', () => {
    it('returns the found Timeoff entity on success', async () => {
      const result = await useCase.execute('timeoff-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('timeoff-1');
        expect(result.value.title).toBe('Summer Vacation');
        expect(result.value.userId).toBe('user-standard-1');
        expect(result.value.businessId).toBe('business-1');
      }
    });

    it('does not mutate the underlying stored entity', async () => {
      const result = await useCase.execute('timeoff-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const stored = TIMEOFF_TEST_DATA.find((t) => t.id === 'timeoff-1');
        expect(result.value).toBe(stored); // same reference, read-only operation
      }
    });
  });
});
