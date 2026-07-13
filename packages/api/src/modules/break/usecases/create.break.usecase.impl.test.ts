import { Test, TestingModule } from '@nestjs/testing';
import {
  Break,
  BreakConflictError,
  CreateBreakCommand,
  err,
  IBreakRepository,
  InfrastructureError,
  UnauthorizedError,
} from '@pikslots/domain';
import { BREAK_TEST_DATA } from '../repository/break.test.data';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { BreakRepositoryTestImpl } from '../repository/break.repository.fake.impl';
import { CreateBreakUseCaseImpl } from './create.break.usecase.impl';

jest.mock('uuid', () => ({
  v7: () => 'mock-generated-id',
}));

function buildCommand(
  overrides: Partial<CreateBreakCommand> = {},
): CreateBreakCommand {
  return {
    userId: 'user-standard-1',
    businessId: 'business-1',
    day: 'thursday',
    startTime: '16:00',
    endTime: '16:30',
    createdBy: 'user-standard-1',
    ...overrides,
  } as CreateBreakCommand;
}

describe('CreateBreakUseCaseImpl', () => {
  let useCase: CreateBreakUseCaseImpl;
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
        CreateBreakUseCaseImpl,
        { provide: IBreakRepository, useClass: BreakRepositoryTestImpl },
        { provide: SecurityContext, useValue: securityContext },
      ],
    }).compile();

    useCase = moduleRef.get(CreateBreakUseCaseImpl);
    repository = moduleRef.get(IBreakRepository);
  });

  describe('authorization', () => {
    it('allows a Platform Owner to create a break for anyone', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
        businessId: 'business-999',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', day: 'thursday' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows a Business Owner to create a break within their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({
          userId: 'user-standard-1',
          businessId: 'business-1',
          day: 'thursday',
        }),
      );

      expect(result.ok).toBe(true);
    });

    it('denies a Business Owner acting outside their own business', async () => {
      Object.assign(securityContext, {
        userId: 'user-business-owner-1',
        role: 'Business Owner',
        businessId: 'business-2',
      });
      const hasConflictSpy = jest.spyOn(repository, 'hasConflict');

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }
      expect(hasConflictSpy).not.toHaveBeenCalled();
    });

    it('allows a Standard user to create a break for themselves', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const result = await useCase.execute(
        buildCommand({ userId: 'user-standard-1', day: 'thursday' }),
      );

      expect(result.ok).toBe(true);
    });

    it('denies a Standard user creating a break for someone else', async () => {
      Object.assign(securityContext, {
        userId: 'user-standard-1',
        role: 'Standard',
        businessId: 'business-1',
      });

      const hasConflictSpy = jest.spyOn(repository, 'hasConflict');
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(
        buildCommand({
          userId: 'user-enhanced-1',
          day: 'thursday',
        }),
      );

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect((result.error as UnauthorizedError).kind).toBe('unauthorized');
      }

      expect(hasConflictSpy).not.toHaveBeenCalled();
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('conflict detection', () => {
    it('rejects creation when the time slot overlaps an existing break', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
      });
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(
        buildCommand({
          userId: 'user-platform-owner-1',
          day: 'monday',
          startTime: '10:30',
          endTime: '10:45',
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect((result.error as BreakConflictError).kind).toBe(
          'break_conflict',
        );
      }
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('allows creation when the time slot does not overlap', async () => {
      Object.assign(securityContext, {
        userId: 'user-platform-owner-1',
        role: 'Platform Owner',
      });

      const result = await useCase.execute(
        buildCommand({
          userId: 'user-platform-owner-1',
          day: 'monday',
          startTime: '17:00',
          endTime: '17:30',
        }),
      );

      expect(result.ok).toBe(true);
    });
  });

  describe('repository failures', () => {
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
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from save', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to save break',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'save').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });
  });

  describe('repository interactions', () => {
    it('calls hasConflict with the correct arguments', async () => {
      const command = buildCommand();

      const hasConflictSpy = jest.spyOn(repository, 'hasConflict');

      await useCase.execute(command);

      expect(hasConflictSpy).toHaveBeenCalledTimes(1);

      expect(hasConflictSpy).toHaveBeenCalledWith(
        command.userId,
        command.day,
        command.startTime,
        command.endTime,
      );
    });
  });
  describe('successful creation', () => {
    it('builds and saves a Break entity matching the command', async () => {
      const command = buildCommand({
        userId: 'user-standard-1',
        businessId: 'business-1',
        day: 'thursday',
        startTime: '16:00',
        endTime: '16:30',
        createdBy: 'user-standard-1',
      });

      const saveSpy = jest.spyOn(repository, 'save');
      const result = await useCase.execute(command);

      expect(result.ok).toBe(true);
      expect(saveSpy).toHaveBeenCalledTimes(1);

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-generated-id',
          userId: command.userId,
          businessId: command.businessId,
          day: command.day,
          startTime: command.startTime,
          endTime: command.endTime,
          createdBy: command.createdBy,
        }),
      );
      if (result.ok) {
        expect(result.value.id).toBe('mock-generated-id');
        expect(result.value.userId).toBe(command.userId);
        expect(result.value.businessId).toBe(command.businessId);
        expect(result.value.day).toBe(command.day);
        expect(result.value.startTime).toBe(command.startTime);
        expect(result.value.endTime).toBe(command.endTime);
      }

      const persisted = BREAK_TEST_DATA.find(
        (b) => b.id === 'mock-generated-id',
      );
      expect(persisted).toBeDefined();
    });
  });
});
