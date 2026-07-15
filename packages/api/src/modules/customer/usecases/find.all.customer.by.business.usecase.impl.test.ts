import { Test, TestingModule } from '@nestjs/testing';
import {
  Customer,
  err,
  ICustomerRepository,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { CUSTOMER_TEST_DATA } from '../repository/customer.test.data';
// import { FindAllCustomersByBusinessUseCaseImpl } from './find-all-customers-by-business.usecase.impl';
import { CustomerRepositoryTestImpl } from '../repository/customer.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { FindAllCustomersByBusinessUseCaseImpl } from './find.all.customers.by.business.usecase.impl';

describe('FindAllCustomersByBusinessUseCaseImpl', () => {
  let useCase: FindAllCustomersByBusinessUseCaseImpl;
  let repository: CustomerRepositoryTestImpl;
  let securityContext: SecurityContext;
  let originalData: Customer[];

  beforeEach(async () => {
    if (!originalData) originalData = [...CUSTOMER_TEST_DATA];
    CUSTOMER_TEST_DATA.length = 0;
    CUSTOMER_TEST_DATA.push(...originalData);

    securityContext = {
      userId: 'user-business-owner-1',
      role: 'Business Owner',
      businessId: 'business-1',
    } as SecurityContext;

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllCustomersByBusinessUseCaseImpl,
        {
          provide: ICustomerRepository,
          useClass: CustomerRepositoryTestImpl,
        },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(FindAllCustomersByBusinessUseCaseImpl);
    repository = moduleRef.get(ICustomerRepository);
  });

  describe('authorization', () => {
    it('allows a Platform Owner to view customers for any business', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999', // different business, shouldn't matter
      });

      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to view customers within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
    });

    it('allows an Admin to view customers within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
    });

    it('allows an Enhanced user to view customers within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
    });

    it('allows a Standard user to view customers within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });
      const findSpy = jest.spyOn(repository, 'findCustomerListByBusiness');

      const result = await useCase.execute('business-2');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findSpy).not.toHaveBeenCalled();
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });
      const findSpy = jest.spyOn(repository, 'findCustomerListByBusiness');

      const result = await useCase.execute('business-2');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findSpy).not.toHaveBeenCalled();
    });

    it('denies an Enhanced user acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const findSpy = jest.spyOn(repository, 'findCustomerListByBusiness');

      const result = await useCase.execute('business-2');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findSpy).not.toHaveBeenCalled();
    });

    it('denies a Standard user acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });
      const findSpy = jest.spyOn(repository, 'findCustomerListByBusiness');

      const result = await useCase.execute('business-2');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findSpy).not.toHaveBeenCalled();
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from findCustomerListByBusiness', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'DB unreachable',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest
        .spyOn(repository, 'findCustomerListByBusiness')
        .mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });
  });

  describe('successful lookup', () => {
    it('returns the id/fullName/profileImageUrl projection for each customer in the business', async () => {
      // business-1 non-deleted customers: customer-1, customer-2, customer-3
      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((c) => c.id);
        expect(ids).toContain('customer-1');
        expect(ids).toContain('customer-2');
        expect(ids).toContain('customer-3');
        expect(ids).not.toContain('customer-business-2-1');

        const alice = result.value.find((c) => c.id === 'customer-1');
        expect(alice?.fullName).toEqual({
          firstName: 'Alice',
          lastName: 'Walker',
        });
        expect(alice?.profileImageUrl).toBe(
          'https://cdn.example.com/avatars/customer-1.jpg',
        );
      }
    });

    it('excludes soft-deleted customers from the business list', async () => {
      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((c) => c.id);
        expect(ids).not.toContain('customer-deleted-1');
      }
    });

    it('returns an empty list for a business with no customers', async () => {
      // Use a Platform Owner so authorization passes regardless of which
      // business is being queried.
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999',
      });

      const result = await useCase.execute('business-does-not-exist');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });
  });
});
