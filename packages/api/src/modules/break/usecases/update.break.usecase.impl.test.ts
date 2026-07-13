import { Test, TestingModule } from '@nestjs/testing';
import {
  Break,
  BreakConflictError,
  BreakNotFoundError,
  err,
  IBreakRepository,
  InfrastructureError,
  UnauthorizedError,
  UpdateBreakCommand,
} from '@pikslots/domain';
import { BREAK_TEST_DATA } from '../repository/break.test.data';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { UpdateBreakUseCaseImpl } from './update.break.usecase.impl';
import { BreakRepositoryTestImpl } from '../repository/break.repository.fake.impl';

function buildCommand(
  overrides: Partial<UpdateBreakCommand> = {},
): UpdateBreakCommand {
  return {
    id: 'break-standard-1',
    day: 'monday',
    startTime: '18:00',
    endTime: '18:30',
    updatedBy: 'user-standard-1',
    ...overrides,
  } as UpdateBreakCommand;
}

describe('UpdateBreakUseCaseImpl', () => {
  let useCase: UpdateBreakUseCaseImpl;
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
        UpdateBreakUseCaseImpl,
        { provide: IBreakRepository, useClass: BreakRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(UpdateBreakUseCaseImpl);
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
    it('allows a Platform Owner to update any break', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999', // different business, shouldn't matter
      });

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1', day: 'thursday' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to update a break within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1', day: 'thursday' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows an Admin to update a break within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1', day: 'thursday' }),
      );

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-2',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('denies an Admin acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-admin-1',
        role: 'Admin',
        businessId: 'business-2',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('allows a Standard user to update their own break', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1', day: 'thursday' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows an Enhanced user to update their own break', async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({
          id: 'break-enhanced-1',
          day: 'thursday',
          startTime: '18:00',
          endTime: '18:30',
          updatedBy: 'user-enhanced-1',
        }),
      );

      expect(result.ok).toBe(true);
    });

    it("denies a Standard user updating someone else's break", async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      // break-admin-1 belongs to user-admin-1, not the caller
      const result = await useCase.execute(
        buildCommand({ id: 'break-admin-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it("denies an Enhanced user updating someone else's break", async () => {
      Object.assign(securityContext, {
        userId: 'user-enhanced-1',
        role: 'Enhanced',
        businessId: 'business-1',
      });
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ id: 'break-standard-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe('conflict detection', () => {
    it('rejects the update when the new time slot overlaps another break', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({
          id: 'break-standard-1',
          day: 'monday',
          startTime: '13:00',
          endTime: '13:30',
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BreakConflictError).kind).toBe(
          'break_conflict',
        );
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('allows the update when the new time slot does not overlap', async () => {
      const result = await useCase.execute(
        buildCommand({
          id: 'break-standard-1',
          day: 'monday',
          startTime: '20:00',
          endTime: '20:30',
        }),
      );

      expect(result.ok).toBe(true);
    });
  });

  describe('known bug: self-conflict on unchanged time slot', () => {
    it('reports a conflict when updating a break to its own unchanged time slot', async () => {
      const result = await useCase.execute(
        buildCommand({
          id: 'break-standard-1',
          day: 'monday',
          startTime: '13:00',
          endTime: '13:30',
          updatedBy: 'user-standard-1',
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BreakConflictError).kind).toBe(
          'break_conflict',
        );
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

    it('propagates an InfrastructureError from hasConflict', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'DB unreachable',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest
        .spyOn(repository, 'hasConflict')
        .mockResolvedValueOnce(err(infraError));
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from update', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to update break',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'hasConflict').mockResolvedValueOnce({
        ok: true,
        value: false,
      });
      jest.spyOn(repository, 'update').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(
        buildCommand({
          id: 'break-standard-1',
          day: 'monday',
          startTime: '20:00',
          endTime: '20:30',
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });

    it('propagates a BreakNotFoundError raised by update itself', async () => {
      const notFoundError: BreakNotFoundError = {
        kind: 'break_not_found',
        by: 'id',
        value: 'break-standard-1',
        message: 'Break not found',
        timestamp: new Date(),
      };
      jest.spyOn(repository, 'hasConflict').mockResolvedValueOnce({
        ok: true,
        value: false,
      });
      jest
        .spyOn(repository, 'update')
        .mockResolvedValueOnce(err(notFoundError));

      const result = await useCase.execute(
        buildCommand({
          id: 'break-standard-1',
          day: 'monday',
          startTime: '20:00',
          endTime: '20:30',
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BreakNotFoundError).kind).toBe(
          'break_not_found',
        );
      }
    });
  });

  describe('successful update', () => {
    it('updates the break and returns the updated entity', async () => {
      const command = buildCommand({
        id: 'break-standard-1',
        day: 'monday',
        startTime: '20:00',
        endTime: '20:30',
        updatedBy: 'user-standard-1',
      });

      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('break-standard-1');
        expect(result.value.day).toBe('monday');
        expect(result.value.startTime).toBe('20:00');
        expect(result.value.endTime).toBe('20:30');
      }

      const persisted = BREAK_TEST_DATA.find(
        (b) => b.id === 'break-standard-1',
      );
      expect(persisted?.startTime).toBe('20:00');
      expect(persisted?.endTime).toBe('20:30');
    });
  });
});
