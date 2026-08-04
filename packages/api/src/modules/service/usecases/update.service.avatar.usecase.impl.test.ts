import { Test, TestingModule } from '@nestjs/testing';
import {
  IServiceRepository,
  InfrastructureError,
  Service,
  ServiceNotFoundError,
  UnauthorizedError,
  err,
  type UpdateServiceAvatarCommand,
} from '@pikslots/domain';
import { SERVICE_TEST_DATA } from '../repository/service.test.data';
import { UpdateServiceAvatarUseCaseImpl } from './update.service.avatar.usecase.impl';
import { ServiceRepositoryTestImpl } from '../repository/service.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import {
  IPikslotS3Service,
  type PikslotS3Service,
} from 'src/shared/s3/s3.service';

function buildCommand(
  overrides: Partial<UpdateServiceAvatarCommand> = {},
): UpdateServiceAvatarCommand {
  return {
    serviceId: 'service-haircut-1',
    avatarKey: 'https://cdn.example.com/services/haircut-new.jpg',
    ...overrides,
  };
}

describe('UpdateServiceAvatarUseCaseImpl', () => {
  let useCase: UpdateServiceAvatarUseCaseImpl;
  let repository: ServiceRepositoryTestImpl;
  let s3Service: jest.Mocked<PikslotS3Service>;
  let securityContext: SecurityContext;
  let originalData: Service[];

  beforeEach(async () => {
    if (!originalData) originalData = [...SERVICE_TEST_DATA];
    SERVICE_TEST_DATA.length = 0;
    SERVICE_TEST_DATA.push(...originalData);

    securityContext = {
      userId: 'user-business-owner-1',
      role: 'Business Owner',
      businessId: 'business-1',
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateServiceAvatarUseCaseImpl,
        {
          provide: IServiceRepository,
          useClass: ServiceRepositoryTestImpl,
        },
        {
          provide: IPikslotS3Service,
          useValue: { deleteFile: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(UpdateServiceAvatarUseCaseImpl);
    repository = moduleRef.get(IServiceRepository);
    s3Service = moduleRef.get(IPikslotS3Service);
  });

  describe('not found', () => {
    it('returns service_not_found when the service does not exist', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ serviceId: 'non-existent-service' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as ServiceNotFoundError).kind).toBe(
          'service_not_found',
        );
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('authorization', () => {
    it('allows a Platform Owner to update any service avatar', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999',
      });

      const result = await useCase.execute(
        buildCommand({ serviceId: 'service-business-2-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to update service avatar within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ serviceId: 'service-haircut-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows an Admin to update service avatar within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ serviceId: 'service-massage-1' }),
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
        buildCommand({ serviceId: 'service-business-2-1' }),
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
        buildCommand({ serviceId: 'service-business-2-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('denies an Enhanced user even within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ serviceId: 'service-haircut-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('denies a Standard user even within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ serviceId: 'service-haircut-1' }),
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
        message: 'Failed to update service',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'update').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(
        buildCommand({ serviceId: 'service-haircut-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('conditional S3 cleanup', () => {
    it('deletes the old avatar when the new key differs from the old one', async () => {
      const result = await useCase.execute(
        buildCommand({
          serviceId: 'service-haircut-1',
          avatarKey: 'https://cdn.example.com/services/haircut-new.jpg',
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).toHaveBeenCalledTimes(1);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(
        'https://cdn.example.com/services/haircut-1.jpg',
      );
    });

    it('does not delete when the new key is identical to the old one', async () => {
      const result = await useCase.execute(
        buildCommand({
          serviceId: 'service-haircut-1',
          avatarKey: 'https://cdn.example.com/services/haircut-1.jpg',
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
            serviceId: 'service-haircut-1',
            avatarKey: 'https://cdn.example.com/services/haircut-new.jpg',
          }),
        ),
      ).rejects.toThrow('S3 unreachable');
    });
  });

  describe('successful update', () => {
    it('returns the updated service with the new avatar url and persists it', async () => {
      const command = buildCommand({
        serviceId: 'service-haircut-1',
        avatarKey: 'https://cdn.example.com/services/haircut-new.jpg',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('service-haircut-1');
        expect(result.value.serviceAvatar).toBe(command.avatarKey);
      }
      expect(updateSpy).toHaveBeenCalledTimes(1);

      const [savedArg] = updateSpy.mock.calls[0];
      expect(savedArg.id).toBe('service-haircut-1');
      expect(savedArg.serviceAvatar).toBe(command.avatarKey);

      const persisted = SERVICE_TEST_DATA.find(
        (s) => s.id === 'service-haircut-1',
      );
      expect(persisted?.serviceAvatar).toBe(command.avatarKey);
    });
  });
});
