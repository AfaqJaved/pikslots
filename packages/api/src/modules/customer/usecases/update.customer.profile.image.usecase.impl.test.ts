import { Test, TestingModule } from '@nestjs/testing';
import {
  Customer,
  CustomerNotFoundError,
  err,
  ICustomerRepository,
  InfrastructureError,
  UnauthorizedError,
  type UpdateCustomerProfileImageCommand,
} from '@pikslots/domain';
import { CUSTOMER_TEST_DATA } from '../repository/customer.test.data';
import { UpdateCustomerProfileImageUseCaseImpl } from './update.customer.profile.image.usecase.impl';
import { CustomerRepositoryTestImpl } from '../repository/customer.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import {
  IPikslotS3Service,
  type PikslotS3Service,
} from 'src/shared/s3/s3.service';

function buildCommand(
  overrides: Partial<UpdateCustomerProfileImageCommand> = {},
): UpdateCustomerProfileImageCommand {
  return {
    customerId: 'customer-1',
    profileImageKey: 'https://cdn.example.com/avatars/customer-1-new.jpg',
    ...overrides,
  };
}

describe('UpdateCustomerProfileImageUseCaseImpl', () => {
  let useCase: UpdateCustomerProfileImageUseCaseImpl;
  let repository: CustomerRepositoryTestImpl;
  let s3Service: jest.Mocked<PikslotS3Service>;
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
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCustomerProfileImageUseCaseImpl,
        {
          provide: ICustomerRepository,
          useClass: CustomerRepositoryTestImpl,
        },
        {
          provide: IPikslotS3Service,
          useValue: { deleteFile: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(UpdateCustomerProfileImageUseCaseImpl);
    repository = moduleRef.get(ICustomerRepository);
    s3Service = moduleRef.get(IPikslotS3Service);
  });

  describe('not found', () => {
    it('returns customer_not_found when the customer does not exist', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ customerId: 'non-existent-customer' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as CustomerNotFoundError).kind).toBe(
          'customer_not_found',
        );
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('authorization', () => {
    it('allows a Platform Owner to update any customer profile image', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999',
      });

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to update profile image within their own business', async () => {
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

    it('allows an Admin to update profile image within their own business', async () => {
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

    it('allows an Enhanced user to update profile image within their own business', async () => {
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

    it('allows a Standard user to update profile image within their own business', async () => {
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
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('denies an Enhanced user acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('denies a Standard user acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-business-2-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
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
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from update', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to update customer',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'update').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(
        buildCommand({ customerId: 'customer-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('conditional S3 cleanup', () => {
    it('deletes the old image when the new key differs from the old one', async () => {
      const result = await useCase.execute(
        buildCommand({
          customerId: 'customer-1',
          profileImageKey: 'https://cdn.example.com/avatars/customer-1-new.jpg',
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).toHaveBeenCalledTimes(1);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(
        'https://cdn.example.com/avatars/customer-1.jpg',
      );
    });

    it('does not delete when the old profileImageUrl is null', async () => {
      const result = await useCase.execute(
        buildCommand({
          customerId: 'customer-2',
          profileImageKey: 'https://cdn.example.com/avatars/customer-2-new.jpg',
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('does not delete when the new key is identical to the old one', async () => {
      const result = await useCase.execute(
        buildCommand({
          customerId: 'customer-1',
          profileImageKey: 'https://cdn.example.com/avatars/customer-1.jpg',
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('S3 cleanup failure', () => {
    it('propagates the error when S3 deletion fails (no try/catch in use case)', async () => {
      s3Service.deleteFile.mockRejectedValueOnce(new Error('S3 unreachable'));

      await expect(
        useCase.execute(
          buildCommand({
            customerId: 'customer-1',
            profileImageKey:
              'https://cdn.example.com/avatars/customer-1-new.jpg',
          }),
        ),
      ).rejects.toThrow('S3 unreachable');
    });
  });

  describe('successful update', () => {
    it('returns the updated customer with the new profile image url and persists it', async () => {
      const command = buildCommand({
        customerId: 'customer-1',
        profileImageKey: 'https://cdn.example.com/avatars/customer-1-new.jpg',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('customer-1');
        expect(result.value.profileImageUrl).toBe(command.profileImageKey);
      }
      expect(updateSpy).toHaveBeenCalledTimes(1);

      const [savedArg] = updateSpy.mock.calls[0];
      expect(savedArg.id).toBe('customer-1');
      expect(savedArg.profileImageUrl).toBe(command.profileImageKey);

      const persisted = CUSTOMER_TEST_DATA.find((c) => c.id === 'customer-1');
      expect(persisted?.profileImageUrl).toBe(command.profileImageKey);
    });
  });
});
