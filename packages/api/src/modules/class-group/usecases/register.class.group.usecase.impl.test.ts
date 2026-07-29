import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import {
  ClassGroupAlreadyExistsInBusinessError,
  IClassGroupRepository,
  InfrastructureError,
  err,
} from '@pikslots/domain';
import type { RegisterClassGroupCommand } from '@pikslots/domain';
import { ClassGroupRepositoryTestImpl } from '../repository/class.group.repository.fake.impl';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import { RegisterClassGroupUseCaseImpl } from './register.class.group.usecase.impl';
import { CLASS_GROUP_TEST_DATA } from '../repository/class.group.test.data';

jest.mock('uuid', () => ({ v7: () => 'mock-generated-id' }));

function buildCommand(
  overrides: Partial<RegisterClassGroupCommand> = {},
): RegisterClassGroupCommand {
  return {
    name: 'Yoga Group',
    businessId: 'business-1',
    createdBy: 'user-owner-1',
    associatedClasses: [],
    ...overrides,
  };
}

describe('RegisterClassGroupUseCaseImpl', () => {
  let useCase: RegisterClassGroupUseCaseImpl;
  let repository: ClassGroupRepositoryTestImpl;
  let queueAddMock: jest.Mock;
  let originalData: typeof CLASS_GROUP_TEST_DATA;

  const QUEUE_TOKEN = getQueueToken(
    PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_GROUP_CLASSES,
  );

  beforeEach(async () => {
    if (!originalData) originalData = [...CLASS_GROUP_TEST_DATA];
    CLASS_GROUP_TEST_DATA.length = 0;
    CLASS_GROUP_TEST_DATA.push(...originalData);

    repository = new ClassGroupRepositoryTestImpl(CLASS_GROUP_TEST_DATA);
    queueAddMock = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterClassGroupUseCaseImpl,
        { provide: IClassGroupRepository, useValue: repository },
        { provide: QUEUE_TOKEN, useValue: { add: queueAddMock } },
      ],
    }).compile();

    useCase = module.get(RegisterClassGroupUseCaseImpl);
  });

  // ── Name conflict ────────────────────────────────────────────────────────

  describe('name already exists in business', () => {
    it('returns class_group_already_exists when the name is taken in the same business', async () => {
      const saveSpy = jest.spyOn(repository, 'save');

      // "Hair Styling" already exists in business-1 (class-group-hair-1)
      const result = await useCase.execute(
        buildCommand({ name: 'Hair Styling', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('class_group_already_exists');
        expect(
          (result.error as ClassGroupAlreadyExistsInBusinessError).name,
        ).toBe('Hair Styling');
      }
      expect(saveSpy).not.toHaveBeenCalled();
      expect(queueAddMock).not.toHaveBeenCalled();
    });

    it('allows the same name if it only exists in a different business', async () => {
      // "Hair Styling" exists in business-2, not business-1
      const result = await useCase.execute(
        buildCommand({ name: 'Hair Styling', businessId: 'business-3' }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows reusing a name that only exists on a soft-deleted group', async () => {
      // "Retired Group" is soft-deleted in business-1
      const result = await useCase.execute(
        buildCommand({ name: 'Retired Group', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
    });
  });

  // ── Successful registration ──────────────────────────────────────────────

  describe('successful registration', () => {
    it('returns ok({ message: "success" }) and persists a new class group', async () => {
      const result = await useCase.execute(
        buildCommand({ name: 'Pilates Group', businessId: 'business-1' }),
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ message: 'success' });
      }

      const persisted = CLASS_GROUP_TEST_DATA.find(
        (g) => g.id === 'mock-generated-id',
      );
      expect(persisted).toBeDefined();
      expect(persisted?.name).toBe('Pilates Group');
      expect(persisted?.businessId).toBe('business-1');
      expect(persisted?.createdBy).toBe('user-owner-1');
      expect(persisted?.isDeleted).toBe(false);
    });

    it('generates the id via uuid v7', async () => {
      await useCase.execute(buildCommand({ name: 'Cardio Group' }));

      const persisted = CLASS_GROUP_TEST_DATA.find(
        (g) => g.name === 'Cardio Group',
      );
      expect(persisted?.id).toBe('mock-generated-id');
    });
  });

  // ── Sync queue behavior ───────────────────────────────────────────────────

  describe('sync queue', () => {
    it('does NOT fire the sync queue when associatedClasses is empty', async () => {
      await useCase.execute(
        buildCommand({ name: 'Empty Group', associatedClasses: [] }),
      );

      expect(queueAddMock).not.toHaveBeenCalled();
    });

    it('fires the sync queue with classGroupId, classIds, businessId, and assignedBy when associatedClasses is non-empty', async () => {
      await useCase.execute(
        buildCommand({
          name: 'Group With Classes',
          businessId: 'business-1',
          createdBy: 'user-admin-1',
          associatedClasses: ['class-a', 'class-b'],
        }),
      );

      expect(queueAddMock).toHaveBeenCalledTimes(1);
      expect(queueAddMock).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_GROUP_CLASSES,
        {
          classGroupId: 'mock-generated-id',
          classIds: ['class-a', 'class-b'],
          businessId: 'business-1',
          assignedBy: 'user-admin-1',
        },
      );
    });
  });

  // ── Repository interaction ───────────────────────────────────────────────

  describe('repository interaction', () => {
    it('calls existsByName with command.name and command.businessId', async () => {
      const existsByNameSpy = jest.spyOn(repository, 'existsByName');

      await useCase.execute(
        buildCommand({ name: 'Spin Group', businessId: 'business-1' }),
      );

      expect(existsByNameSpy).toHaveBeenCalledWith('Spin Group', 'business-1');
    });

    it('calls save with a newly created ClassGroup entity, only after the name check passes', async () => {
      const saveSpy = jest.spyOn(repository, 'save');

      await useCase.execute(
        buildCommand({
          name: 'Barre Group',
          businessId: 'business-1',
          createdBy: 'user-owner-9',
        }),
      );

      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-generated-id',
          name: 'Barre Group',
          businessId: 'business-1',
          createdBy: 'user-owner-9',
        }),
      );
    });
  });

  // ── Repository failure propagation ───────────────────────────────────────

  describe('repository failures', () => {
    it('propagates an InfrastructureError from existsByName and does not save or fire the queue', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to check class group existence by name',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest
        .spyOn(repository, 'existsByName')
        .mockResolvedValueOnce(err(infraError));
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(infraError);
      expect(saveSpy).not.toHaveBeenCalled();
      expect(queueAddMock).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from save and does not fire the queue', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to save class group',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'save').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(
        buildCommand({ associatedClasses: ['class-a'] }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(infraError);
      expect(queueAddMock).not.toHaveBeenCalled();
    });

    it('propagates a class_group_already_exists from save (DB-level race after existsByName passed) and does not fire the queue', async () => {
      const raceError: ClassGroupAlreadyExistsInBusinessError = {
        kind: 'class_group_already_exists',
        name: 'Racing Group',
        businessId: 'business-1',
        message:
          "A class group named 'Racing Group' already exists for this business",
        timestamp: new Date(),
      };
      jest.spyOn(repository, 'save').mockResolvedValueOnce(err(raceError));

      const result = await useCase.execute(
        buildCommand({
          name: 'Racing Group',
          associatedClasses: ['class-a'],
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(raceError);
      expect(queueAddMock).not.toHaveBeenCalled();
    });
  });
});
