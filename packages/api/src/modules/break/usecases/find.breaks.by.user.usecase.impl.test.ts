import { Test, TestingModule } from '@nestjs/testing';
import {
  Break,
  err,
  FindBreaksByUserCommand,
  IBreakRepository,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { BREAK_TEST_DATA } from '../repository/break.test.data';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { FindBreaksByUserUseCaseImpl } from './find.breaks.by.user.usecase.impl';
import { BreakRepositoryTestImpl } from '../repository/break.repository.fake.impl';

function buildCommand(
  overrides: Partial<FindBreaksByUserCommand> = {},
): FindBreaksByUserCommand {
  return {
    userId: 'user-standard-1',
    businessId: 'business-1',
    ...overrides,
  } as FindBreaksByUserCommand;
}

describe('FindBreaksByUserUseCaseImpl', () => {
  let useCase: FindBreaksByUserUseCaseImpl;
  let repository: BreakRepositoryTestImpl;
  let securityContext: SecurityContext;
  let originalData: Break[];

  beforeEach(async () => {
    if (!originalData) originalData = [...BREAK_TEST_DATA];
    BREAK_TEST_DATA.length = 0;
    BREAK_TEST_DATA.push(...originalData);

    securityContext = {
      userId: 'user-standard-1',
      role: 'Standard',
      businessId: 'business-1',
    } as SecurityContext;

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindBreaksByUserUseCaseImpl,
        { provide: IBreakRepository, useClass: BreakRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(FindBreaksByUserUseCaseImpl);
    repository = moduleRef.get(IBreakRepository);
  });

  describe('authorization', () => {
    it('allows a Platform Owner to view breaks for any user', async () => {
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

    it('allows a Business Owner to view breaks within their own business', async () => {
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

    it('allows an Admin to view breaks within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
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

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
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

    it('allows a Standard user to view their own breaks', async () => {
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

    it('allows an Enhanced user to view their own breaks', async () => {
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

    it("denies a Standard user viewing someone else's breaks", async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });
      const findSpy = jest.spyOn(repository, 'findAllByUser');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-admin-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(findSpy).not.toHaveBeenCalled();
    });

    it("denies an Enhanced user viewing someone else's breaks", async () => {
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
        message: 'DB unreachable',
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

  describe('successful lookup', () => {
    it('returns all breaks belonging to the user', async () => {
      // user-standard-1 has break-standard-1, break-standard-2, and the
      // soft-deleted break-deleted-1 in the fixtures
      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((b) => b.id);
        expect(ids).toContain('break-standard-1');
        expect(ids).toContain('break-standard-2');
        expect(result.value.every((b) => b.userId === 'user-standard-1')).toBe(
          true,
        );
      }
    });

    it('returns an empty array when the user has no breaks', async () => {
      Object.assign(securityContext, {
        userId: 'user-with-no-breaks',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({
          userId: 'user-with-no-breaks',
          businessId: 'business-1',
        }),
      );

      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });
  });

  describe('fake vs real repository mismatch', () => {
    // NOTE: BreakRepositoryTestImpl.findAllByUser does not filter out
    // soft-deleted rows, but the real Kysely-backed BreakRepositoryImpl does
    // (`.where('is_deleted', '=', false)`). Against the fake, the result for
    // user-standard-1 includes break-deleted-1; against the real repository
    // it would be excluded.
    it('includes a soft-deleted break via the fake repository', async () => {
      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((b) => b.id);
        expect(ids).toContain('break-deleted-1');
      }
    });
  });
});
