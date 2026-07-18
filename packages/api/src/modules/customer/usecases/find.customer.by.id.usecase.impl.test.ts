import { Test, TestingModule } from '@nestjs/testing';
import {
  Customer,
  CustomerNotFoundError,
  err,
  FindCustomerByIdCommand,
  ICustomerRepository,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { CUSTOMER_TEST_DATA } from '../repository/customer.test.data';
import { CustomerRepositoryTestImpl } from '../repository/customer.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { FindCustomerByIdUseCaseImpl } from './find.customer.by.id.usecase.impl';

function buildCommand(
  overrides: Partial<FindCustomerByIdCommand> = {},
): FindCustomerByIdCommand {
  return {
    customerId: 'customer-1',
    ...overrides,
  } as FindCustomerByIdCommand;
}

describe('FindCustomerByIdUseCaseImpl', () => {
  let useCase: FindCustomerByIdUseCaseImpl;
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
        FindCustomerByIdUseCaseImpl,
        {
          provide: ICustomerRepository,
          useClass: CustomerRepositoryTestImpl,
        },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(FindCustomerByIdUseCaseImpl);
    repository = moduleRef.get(ICustomerRepository);
  });

  describe('not found', () => {
    it('returns customer_not_found when the customer does not exist', async () => {
      const result = await useCase.execute(
        buildCommand({ customerId: 'non-existent-customer' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as CustomerNotFoundError).kind).toBe(
          'customer_not_found',
        );
      }
    });
  });

  describe('authorization', () => {
    it('allows a Platform Owner to view any customer', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999', // different business, shouldn't matter
      });

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to view a customer within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows an Admin to view a customer within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-2' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows an Enhanced user to view a customer within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-3' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Standard user to view a customer within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('denies an Enhanced user acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('denies a Standard user acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
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

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });
  });

  describe('successful lookup', () => {
    it('returns the full CustomerProps snapshot when found and authorized', async () => {
      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-1' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('customer-1');
        expect(result.value.name).toEqual({
          firstName: 'Alice',
          lastName: 'Walker',
        });
        expect(result.value.email).toBe('alice.walker@example.com');
        expect(result.value.businessId).toBe('business-1');
        expect(result.value.isDeleted).toBe(false);
        expect(result.value).not.toBeInstanceOf(Customer);
      }
    });

    it('returns null-valued optional fields as-is for a minimal customer', async () => {
      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-3' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.email).toBeNull();
        expect(result.value.company).toBeNull();
        expect(result.value.address).toBeNull();
      }
    });
  });
});
