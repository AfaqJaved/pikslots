import { Test, TestingModule } from '@nestjs/testing';
import {
  Break,
  BreakNotFoundError,
  err,
  FindBreakByIdCommand,
  IBreakRepository,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { BREAK_TEST_DATA } from '../repository/break.test.data';

import { FindBreakByIdUseCaseImpl } from './find.break.by.id.usecase.impl';
import { BreakRepositoryTestImpl } from '../repository/break.repository.fake.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';

function buildCommand(
  overrides: Partial<FindBreakByIdCommand> = {},
): FindBreakByIdCommand {
  return {
    id: 'break-standard-1',
    ...overrides,
  } as FindBreakByIdCommand;
}

describe('FindBreakByIdUseCaseImpl', () => {
  let useCase: FindBreakByIdUseCaseImpl;
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
        FindBreakByIdUseCaseImpl,
        { provide: IBreakRepository, useClass: BreakRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(FindBreakByIdUseCaseImpl);
    repository = moduleRef.get(IBreakRepository);
  });

  describe('not found', () => {
    it('returns break_not_found when the break does not exist', async () => {
      const result = await useCase.execute(
        buildCommand({ id: 'non-existent-break' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BreakNotFoundError).kind).toBe(
          'break_not_found',
        );
      }
    });
  });

  describe('authorization', () => {
    it('allows a Platform Owner to view any break', async () => {
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

    it('allows a Business Owner to view a break within their own business', async () => {
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

    it('allows an Admin to view a break within their own business', async () => {
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

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
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
        businessId: 'business-2',
      });

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it('allows a Standard user to view their own break', async () => {
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

    it('allows an Enhanced user to view their own break', async () => {
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

    it("denies a Standard user viewing someone else's break", async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      // break-admin-1 belongs to user-admin-1, not the caller
      const result = await useCase.execute(
        buildCommand({ id: 'break-admin-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
    });

    it("denies an Enhanced user viewing someone else's break", async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
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
    it('returns the break when found and caller is authorized', async () => {
      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('break-standard-1');
        expect(result.value.userId).toBe('user-standard-1');
      }
    });
  });

  describe('fake vs real repository mismatch', () => {
    // NOTE: BreakRepositoryTestImpl.findById does not filter out soft-deleted
    // rows, but the real Kysely-backed BreakRepositoryImpl does
    // (`.where('is_deleted', '=', false)`). Against the fake, this resolves
    // ok(<the deleted break>); against the real repository, findById would
    // return null and the use case would return break_not_found instead.
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
