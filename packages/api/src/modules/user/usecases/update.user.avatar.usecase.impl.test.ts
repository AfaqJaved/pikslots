import { Test, TestingModule } from '@nestjs/testing';
import {
  IUserRepository,
  InfrastructureError,
  UnauthorizedError,
  User,
  UserNotFoundError,
  err,
  type UpdateUserAvatarCommand,
} from '@pikslots/domain';
import { USER_TEST_DATA } from '../repository/user.test.data';
import { UpdateUserAvatarUseCaseImpl } from './update.user.avatar.usecase.impl';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import {
  IPikslotS3Service,
  type PikslotS3Service,
} from 'src/shared/s3/s3.service';

function buildCommand(
  overrides: Partial<UpdateUserAvatarCommand> = {},
): UpdateUserAvatarCommand {
  return {
    userId: 'user-standard-1',
    avatarKey: 'https://cdn.example.com/avatars/standard-new.jpg',
    ...overrides,
  };
}

describe('UpdateUserAvatarUseCaseImpl', () => {
  let useCase: UpdateUserAvatarUseCaseImpl;
  let repository: UserRepositoryTestImpl;
  let s3Service: jest.Mocked<PikslotS3Service>;
  let securityContext: SecurityContext;
  let originalData: User[];

  beforeEach(async () => {
    if (!originalData) originalData = [...USER_TEST_DATA];
    USER_TEST_DATA.length = 0;
    USER_TEST_DATA.push(...originalData);

    securityContext = {
      userId: 'user-standard-1',
      role: 'Standard',
      businessId: 'business-1',
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserAvatarUseCaseImpl,
        {
          provide: IUserRepository,
          useClass: UserRepositoryTestImpl,
        },
        {
          provide: IPikslotS3Service,
          useValue: { deleteFile: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(UpdateUserAvatarUseCaseImpl);
    repository = moduleRef.get(IUserRepository);
    s3Service = moduleRef.get(IPikslotS3Service);
  });

  describe('not found', () => {
    it('returns user_not_found when the user does not exist', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ userId: 'non-existent-user' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UserNotFoundError).kind).toBe('user_not_found');
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('authorization', () => {
    it('allows a Platform Owner to update any user avatar', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: null,
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to update avatar of a user in their business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows an Admin to update avatar of a user in their business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows an Enhanced user to update their own avatar', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-enhanced-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Standard user to update their own avatar', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-999',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('denies an Admin acting outside their business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-999',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('denies an Enhanced user updating another user avatar (not self)', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('denies a Standard user updating another user avatar (not self)', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-enhanced-1' }),
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
        message: 'Failed to update user',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'update').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('S3 cleanup', () => {
    it('deletes the old avatar when avatarUrl was set', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const idx = USER_TEST_DATA.findIndex(
        (u) => u.id === 'user-business-owner-1',
      );
      USER_TEST_DATA[idx] = USER_TEST_DATA[idx].updateAvatarUrl(
        'https://cdn.example.com/avatars/bob.jpg',
      );

      const result = await useCase.execute(
        buildCommand({
          userId: 'user-business-owner-1',
          avatarKey: 'https://cdn.example.com/avatars/bob-new.jpg',
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).toHaveBeenCalledTimes(1);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(
        'https://cdn.example.com/avatars/bob.jpg',
      );
    });

    it('does not delete when the old avatarUrl is null', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({
          userId: 'user-standard-1',
          avatarKey: 'https://cdn.example.com/avatars/standard-new.jpg',
        }),
      );

      expect(result.ok).toBe(true);
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('S3 cleanup failure', () => {
    it('propagates the error when S3 deletion fails (no try/catch in use case)', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const idx = USER_TEST_DATA.findIndex(
        (u) => u.id === 'user-business-owner-1',
      );
      USER_TEST_DATA[idx] = USER_TEST_DATA[idx].updateAvatarUrl(
        'https://cdn.example.com/avatars/bob.jpg',
      );

      s3Service.deleteFile.mockRejectedValueOnce(new Error('S3 unreachable'));

      await expect(
        useCase.execute(
          buildCommand({
            userId: 'user-business-owner-1',
            avatarKey: 'https://cdn.example.com/avatars/bob-new.jpg',
          }),
        ),
      ).rejects.toThrow('S3 unreachable');
    });
  });

  describe('successful update', () => {
    it('returns the updated user with the new avatar url and persists it', async () => {
      const command = buildCommand({
        userId: 'user-standard-1',
        avatarKey: 'https://cdn.example.com/avatars/standard-new.jpg',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('user-standard-1');
        expect(result.value.avatarUrl).toBe(command.avatarKey);
      }
      expect(updateSpy).toHaveBeenCalledTimes(1);

      const [savedArg] = updateSpy.mock.calls[0];
      expect(savedArg.id).toBe('user-standard-1');
      expect(savedArg.avatarUrl).toBe(command.avatarKey);

      const persisted = USER_TEST_DATA.find((u) => u.id === 'user-standard-1');
      expect(persisted?.avatarUrl).toBe(command.avatarKey);
    });
  });
});
