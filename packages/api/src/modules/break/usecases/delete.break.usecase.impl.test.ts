import { Test, TestingModule } from '@nestjs/testing';
import {
  Break,
  BreakNotFoundError,
  DeleteBreakCommand,
  err,
  IBreakRepository,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
// import { BreakRepositoryTestImpl } from '../repository/break.repository.test.impl';
import { BREAK_TEST_DATA } from '../repository/break.test.data';
// import { DeleteBreakUseCaseImpl } from './delete-break.usecase.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { DeleteBreakUseCaseImpl } from './delete.break.usecase.impl';
import { BreakRepositoryTestImpl } from '../repository/break.repository.fake.impl';

function buildCommand(
  overrides: Partial<DeleteBreakCommand> = {},
): DeleteBreakCommand {
  return {
    id: 'break-standard-1',
    ...overrides,
  } as DeleteBreakCommand;
}

describe('DeleteBreakUseCaseImpl', () => {
  let useCase: DeleteBreakUseCaseImpl;
  let repository: BreakRepositoryTestImpl;
  let securityContext: SecurityContext;
  let originalData: Break[];

  beforeEach(async () => {
    // Snapshot once, restore before every test so delete() in one test
    // can't remove fixtures that a later test still relies on.
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
        DeleteBreakUseCaseImpl,
        { provide: IBreakRepository, useClass: BreakRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(DeleteBreakUseCaseImpl);
    repository = moduleRef.get(IBreakRepository);
  });

  describe('not found', () => {
    it('returns break_not_found when the break does not exist', async () => {
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute(
        buildCommand({ id: 'non-existent-break' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BreakNotFoundError).kind).toBe(
          'break_not_found',
        );
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });

  describe('authorization', () => {
    it('allows a Platform Owner to delete any break', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999', // different business, shouldn't matter
      });

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to delete a break within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows an Admin to delete a break within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-2',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-2',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('allows a Standard user to delete their own break', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows an Enhanced user to delete their own break', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ id: 'break-enhanced-1' }),
      );

      expect(result.ok).toBe(true);
    });

    it("denies a Standard user deleting someone else's break", async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      // break-admin-1 belongs to user-admin-1, not the caller
      const result = await useCase.execute(
        buildCommand({ id: 'break-admin-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it("denies an Enhanced user deleting someone else's break", async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(deleteSpy).not.toHaveBeenCalled();
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
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('still resolves ok(undefined) even if delete() itself fails', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to delete break',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'delete').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
      );

      expect(result.ok).toBe(true);
    });
  });

  describe('successful deletion', () => {
    it('deletes the break and returns ok(undefined)', async () => {
      const deleteSpy = jest.spyOn(repository, 'delete');

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeUndefined();
      }
      expect(deleteSpy).toHaveBeenCalledWith('break-standard-1');
    });
  });

  describe('fake vs real repository mismatch', () => {
    // NOTE: BreakRepositoryTestImpl.findById does not filter out soft-deleted
    // rows, but the real Kysely-backed BreakRepositoryImpl does
    // (`.where('is_deleted', '=', false)`). Against the fake, this resolves
    // ok(true) for a break that's already soft-deleted; against the real
    // repository, findById would return null and the use case would return
    // break_not_found instead. Surfacing this so the fake can be aligned if
    // that matters for this use case.
    it('finds an already soft-deleted break via the fake repository', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ id: 'break-deleted-1' }),
      );

      expect(result.ok).toBe(true);
    });
  });
});
