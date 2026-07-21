import { Test, TestingModule } from '@nestjs/testing';
import {
  Business,
  BusinessInactiveError,
  BusinessNotFoundError,
  BusinessSuspendedError,
  err,
  IBusinessRepository,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { FindBusinessByIdUseCaseImpl } from './find.business.by.id.usecase.impl';
import { BusinessRepositoryTestImpl } from '../repository/business.repository.fake.impl.test';
import { BUSINESS_TEST_DATA } from '../repository/business.fake.data';

describe('FindBusinessByIdUseCaseImpl', () => {
  let useCase: FindBusinessByIdUseCaseImpl;
  let repository: BusinessRepositoryTestImpl;
  let securityContext: SecurityContext;
  let originalData: Business[];

  beforeEach(async () => {
    if (!originalData) originalData = [...BUSINESS_TEST_DATA];
    BUSINESS_TEST_DATA.length = 0;
    BUSINESS_TEST_DATA.push(...originalData);

    securityContext = {
      userId: 'user-standard-1',
      role: 'Standard',
      businessId: 'business-1',
    } as SecurityContext;

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindBusinessByIdUseCaseImpl,
        {
          provide: IBusinessRepository,
          useClass: BusinessRepositoryTestImpl,
        },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(FindBusinessByIdUseCaseImpl);
    repository = moduleRef.get(IBusinessRepository);
  });

  describe('authorization', () => {
    it("denies a caller with role 'No Access', regardless of target business", async () => {
      Object.assign(securityContext, { role: 'No Access' });
      const findByIdSpy = jest.spyOn(repository, 'findById');

      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findByIdSpy).not.toHaveBeenCalled();
    });

    // There is no business-scoping check here at all -- every role other
    // than 'No Access' can look up any business by id, including one they
    // have no other relationship to.
    it.each([
      'Platform Owner',
      'Business Owner',
      'Admin',
      'Enhanced',
      'Standard',
    ])('allows a caller with role %s to look up any business', async (role) => {
      Object.assign(securityContext, {
        role,
        businessId: 'business-999', // unrelated to the target business
      });

      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
    });
  });

  describe('not found', () => {
    it('returns business_not_found when the business does not exist', async () => {
      const result = await useCase.execute('non-existent-business');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BusinessNotFoundError).kind).toBe(
          'business_not_found',
        );
      }
    });

    it('treats a soft-deleted business as not found', async () => {
      const result = await useCase.execute('business-deleted-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BusinessNotFoundError).kind).toBe(
          'business_not_found',
        );
      }
    });
  });

  describe('status handling', () => {
    it('returns business_suspended for a suspended business, with the reason attached', async () => {
      // business-3 is suspended with a specific suspendedReason
      const result = await useCase.execute('business-3');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        const error = result.error as BusinessSuspendedError;
        expect(error.kind).toBe('business_suspended');
        expect(error.reason).toBe(
          'Payment failed for 3 consecutive billing cycles.',
        );
      }
    });

    it('returns business_inactive for an inactive business', async () => {
      // business-trial-expired-1 has status: 'inactive'
      const result = await useCase.execute('business-trial-expired-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        const error = result.error as BusinessInactiveError;
        expect(error.kind).toBe('business_inactive');
        expect(error.status).toBe('inactive');
      }
    });

    it('returns the business for an active status', async () => {
      // business-1 has status: 'active'
      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('business-1');
        expect(result.value.status).toBe('active');
      }
    });

    it('returns the business for a pending_setup status', async () => {
      // business-2 has status: 'pending_setup'
      const result = await useCase.execute('business-2');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('business-2');
        expect(result.value.status).toBe('pending_setup');
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

      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });
  });
});
