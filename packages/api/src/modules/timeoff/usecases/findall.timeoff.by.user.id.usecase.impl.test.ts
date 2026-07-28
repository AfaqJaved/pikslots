// find.all.timeoff.by.user.usecase.impl.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  err,
  FindAllTimeoffByUserCommand,
  InfrastructureError,
  ITimeoffRepository,
  UnauthorizedError,
} from '@pikslots/domain';
import { TIMEOFF_TEST_DATA } from '../repository/timeoff.test.data';
import { TimeOffRepositoryTestImpl } from '../repository/timeoff.repository.fake.impl';
// import { FindAllTimeOffByUserUseCaseImpl } from './find.all.timeoff.by.user.usecase.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { FindAllTimeOffByUserUseCaseImpl } from './findall.timeoff.by.user.id.usecase.impl';

function buildCommand(
  overrides: Partial<FindAllTimeoffByUserCommand> = {},
): FindAllTimeoffByUserCommand {
  return {
    userId: 'user-standard-1',
    businessId: 'business-1',
    ...overrides,
  } as FindAllTimeoffByUserCommand;
}

describe('FindAllTimeOffByUserUseCaseImpl', () => {
  let useCase: FindAllTimeOffByUserUseCaseImpl;
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
        FindAllTimeOffByUserUseCaseImpl,
        { provide: ITimeoffRepository, useClass: TimeOffRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(FindAllTimeOffByUserUseCaseImpl);
    repository = moduleRef.get(ITimeoffRepository);
  });

  describe('authorization', () => {
    it("allows a Platform Owner to view any user's timeoffs regardless of business", async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to view timeoffs within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-2',
      });
      const findSpy = jest.spyOn(repository, 'findAllByUser');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findSpy).not.toHaveBeenCalled();
    });

    it('allows an Admin to view timeoffs within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-enhanced-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-2',
      });
      const findSpy = jest.spyOn(repository, 'findAllByUser');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-enhanced-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findSpy).not.toHaveBeenCalled();
    });

    it('allows a Standard user to view their own timeoffs', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it("denies a Standard user viewing someone else's timeoffs, even in the same business", async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });
      const findSpy = jest.spyOn(repository, 'findAllByUser');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-enhanced-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findSpy).not.toHaveBeenCalled();
    });

    it('denies a Standard user viewing their own timeoffs under a mismatched business', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-2',
      });
      const findSpy = jest.spyOn(repository, 'findAllByUser');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findSpy).not.toHaveBeenCalled();
    });

    it('allows an Enhanced user to view their own timeoffs', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-enhanced-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it("denies an Enhanced user viewing someone else's timeoffs", async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const findSpy = jest.spyOn(repository, 'findAllByUser');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findSpy).not.toHaveBeenCalled();
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from findAllByUser', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to get timeoffs',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest
        .spyOn(repository, 'findAllByUser')
        .mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });
  });

  describe('repository interactions', () => {
    it('calls findAllByUser with the command userId and businessId, only after authorization passes', async () => {
      const findSpy = jest.spyOn(repository, 'findAllByUser');
      const command = buildCommand({
        userId: 'user-standard-1',
        businessId: 'business-1',
      });

      await useCase.execute(command);

      expect(findSpy).toHaveBeenCalledTimes(1);
      expect(findSpy).toHaveBeenCalledWith('user-standard-1', 'business-1');
    });
  });

  describe('successful lookup', () => {
    it("returns all of the user's timeoffs for the given business", async () => {
      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((t) => t.id);
        // timeoff-1, timeoff-2, timeoff-5 are active, business-1;
        // timeoff-4 is soft-deleted, business-1; timeoff-6 is business-2.
        expect(ids).toEqual(
          expect.arrayContaining(['timeoff-1', 'timeoff-2', 'timeoff-5']),
        );
      }
    });

    it(
      'includes soft-deleted timeoffs, since findAllByUser has no is_deleted ' +
        'filter in the real repository (matches TimeOffRepositoryImpl SQL)',
      async () => {
        const result = await useCase.execute(
          buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
        );

        expect(result.ok).toBe(true);
        if (result.ok) {
          const found = result.value.find((t) => t.id === 'timeoff-4');
          expect(found).toBeDefined();
          expect(found?.isDeleted).toBe(true);
        }
      },
    );

    it('does not return timeoffs from a different business, even for the same user', async () => {
      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.some((t) => t.id === 'timeoff-6')).toBe(false); // business-2
      }
    });

    it('does not return timeoffs belonging to a different user', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-enhanced-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.some((t) => t.id === 'timeoff-1')).toBe(false); // owned by user-standard-1
      }
    });

    it('returns an empty array when the user has no timeoffs in that business', async () => {
      Object.assign(securityContext, {
        userId: 'user-with-none',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-with-none', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });
  });
});
