import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import {
  ClassGroupAlreadyExistsInBusinessError,
  ClassGroupNotFoundError,
  err,
  IClassGroupRepository,
  InfrastructureError,
} from '@pikslots/domain';
import type { EditClassGroupCommand } from '@pikslots/domain';
import { ClassGroupRepositoryTestImpl } from '../repository/class.group.repository.fake.impl';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import { EditClassGroupUseCaseImpl } from './edit.class.group.usecase.impl';
import { CLASS_GROUP_TEST_DATA } from '../repository/class.group.test.data';

function buildCommand(
  overrides: Partial<EditClassGroupCommand> = {},
): EditClassGroupCommand {
  return {
    classGroupId: 'class-group-hair-1',
    name: 'Hair Styling', // matches fixture — "unchanged name" by default
    businessId: 'business-1',
    classIds: ['class-1', 'class-2'],
    updatedBy: 'user-owner-1',
    ...overrides,
  };
}

describe('EditClassGroupUseCaseImpl', () => {
  let useCase: EditClassGroupUseCaseImpl;
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
        EditClassGroupUseCaseImpl,
        { provide: IClassGroupRepository, useValue: repository },
        { provide: QUEUE_TOKEN, useValue: { add: queueAddMock } },
      ],
    }).compile();

    useCase = module.get(EditClassGroupUseCaseImpl);
  });

  // ── Not found ───────────────────────────────────────────────────────────

  describe('not found', () => {
    it('returns class_group_not_found when the id does not exist', async () => {
      const result = await useCase.execute(
        buildCommand({ classGroupId: 'class-group-nonexistent' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('class_group_not_found');
        expect((result.error as ClassGroupNotFoundError).value).toBe(
          'class-group-nonexistent',
        );
      }
    });

    it('returns class_group_not_found for a soft-deleted group', async () => {
      // class-group-old-1 is soft-deleted in the fixture; findById filters
      // is_deleted = false, so this looks identical to a missing id.
      const result = await useCase.execute(
        buildCommand({
          classGroupId: 'class-group-old-1',
          name: 'Retired Group',
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('class_group_not_found');
      }
    });

    it('does not call existsByName, update, or the queue when not found', async () => {
      const existsByNameSpy = jest.spyOn(repository, 'existsByName');
      const updateSpy = jest.spyOn(repository, 'update');

      await useCase.execute(
        buildCommand({ classGroupId: 'class-group-nonexistent' }),
      );

      expect(existsByNameSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(queueAddMock).not.toHaveBeenCalled();
    });
  });

  // ── Name unchanged ──────────────────────────────────────────────────────

  describe('name unchanged', () => {
    it('skips existsByName and update, but still returns ok and fires the queue', async () => {
      const existsByNameSpy = jest.spyOn(repository, 'existsByName');
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({
          classGroupId: 'class-group-hair-1',
          name: 'Hair Styling', // same as fixture
        }),
      );

      expect(result.ok).toBe(true);
      expect(existsByNameSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(queueAddMock).toHaveBeenCalledTimes(1);
    });

    it('leaves the persisted group entity untouched when only classIds change', async () => {
      const before = CLASS_GROUP_TEST_DATA.find(
        (g) => g.id === 'class-group-hair-1',
      );

      await useCase.execute(
        buildCommand({
          classGroupId: 'class-group-hair-1',
          name: 'Hair Styling',
          classIds: ['class-9'],
        }),
      );

      const after = CLASS_GROUP_TEST_DATA.find(
        (g) => g.id === 'class-group-hair-1',
      );
      expect(after?.name).toBe(before?.name);
      expect(after?.updatedAt).toEqual(before?.updatedAt);
      expect(after?.updatedBy).toBe(before?.updatedBy);
    });
  });

  // ── Name changed — conflict ─────────────────────────────────────────────

  describe('name changed, target name already taken', () => {
    it('returns class_group_already_exists and does not update or fire the queue', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      // class-group-nails-1 already exists in business-1 as "Nail Care"
      const result = await useCase.execute(
        buildCommand({
          classGroupId: 'class-group-hair-1',
          name: 'Nail Care',
          businessId: 'business-1',
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('class_group_already_exists');
        expect(
          (result.error as ClassGroupAlreadyExistsInBusinessError).name,
        ).toBe('Nail Care');
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(queueAddMock).not.toHaveBeenCalled();
    });

    it('does not block renaming to a name already used in a different business', async () => {
      // "Something Totally Unique" doesn't collide with any class-group name
      // in business-1 — this is a genuinely non-colliding rename.
      const result = await useCase.execute(
        buildCommand({
          classGroupId: 'class-group-nails-1',
          name: 'Something Totally Unique',
          businessId: 'business-1',
        }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows reusing a name that only exists on a soft-deleted group', async () => {
      // class-group-old-1 ("Retired Group") is soft-deleted, so existsByName
      // (is_deleted = false) does not treat it as a collision.
      const result = await useCase.execute(
        buildCommand({
          classGroupId: 'class-group-hair-1',
          name: 'Retired Group',
          businessId: 'business-1',
        }),
      );

      expect(result.ok).toBe(true);
    });
  });

  // ── Name changed — success ──────────────────────────────────────────────

  describe('name changed, target name available', () => {
    it('renames the group, persists it, and fires the queue', async () => {
      const result = await useCase.execute(
        buildCommand({
          classGroupId: 'class-group-hair-1',
          name: 'Hair & Beauty',
          businessId: 'business-1',
          updatedBy: 'user-admin-9',
        }),
      );

      expect(result.ok).toBe(true);

      const persisted = CLASS_GROUP_TEST_DATA.find(
        (g) => g.id === 'class-group-hair-1',
      );
      expect(persisted?.name).toBe('Hair & Beauty');
      expect(persisted?.updatedBy).toBe('user-admin-9');
      expect(queueAddMock).toHaveBeenCalledTimes(1);
    });

    it('preserves identity and unrelated fields after rename', async () => {
      const before = CLASS_GROUP_TEST_DATA.find(
        (g) => g.id === 'class-group-hair-1',
      );

      await useCase.execute(
        buildCommand({ classGroupId: 'class-group-hair-1', name: 'Renamed' }),
      );

      const after = CLASS_GROUP_TEST_DATA.find(
        (g) => g.id === 'class-group-hair-1',
      );
      expect(after?.id).toBe(before?.id);
      expect(after?.businessId).toBe(before?.businessId);
      expect(after?.createdAt).toEqual(before?.createdAt);
      expect(after?.createdBy).toBe(before?.createdBy);
    });
  });

  // ── Repository / queue interaction ──────────────────────────────────────

  describe('interactions', () => {
    it('calls findById with command.classGroupId', async () => {
      const findByIdSpy = jest.spyOn(repository, 'findById');

      await useCase.execute(
        buildCommand({ classGroupId: 'class-group-hair-1' }),
      );

      expect(findByIdSpy).toHaveBeenCalledWith('class-group-hair-1');
    });

    it("calls existsByName with command.name and command.businessId, not the found group's businessId", async () => {
      const existsByNameSpy = jest.spyOn(repository, 'existsByName');

      // The group itself belongs to business-1; command declares a different
      // businessId. Locking in current (unchecked-trust) behavior.
      await useCase.execute(
        buildCommand({
          classGroupId: 'class-group-hair-1',
          name: 'New Name',
          businessId: 'business-7',
        }),
      );

      expect(existsByNameSpy).toHaveBeenCalledWith('New Name', 'business-7');
    });

    it('fires the queue with classGroupId, classIds, businessId, and assignedBy from the command', async () => {
      await useCase.execute(
        buildCommand({
          classGroupId: 'class-group-hair-1',
          name: 'Hair Styling',
          businessId: 'business-1',
          classIds: ['class-a', 'class-b'],
          updatedBy: 'user-admin-1',
        }),
      );

      expect(queueAddMock).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.CLASS_GROUP_ASSIGNMENT.SYNC_CLASS_GROUP_CLASSES,
        {
          classGroupId: 'class-group-hair-1',
          classIds: ['class-a', 'class-b'],
          businessId: 'business-1',
          assignedBy: 'user-admin-1',
        },
      );
    });
  });

  // ── Repository failure propagation ──────────────────────────────────────

  describe('repository failures', () => {
    it('propagates an InfrastructureError from findById and does not touch the queue', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find class group by id',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(infraError);
      expect(queueAddMock).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from existsByName and does not update or fire the queue', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to check class group existence by name',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest
        .spyOn(repository, 'existsByName')
        .mockResolvedValueOnce(err(infraError));
      const updateSpy = jest.spyOn(repository, 'update');

      const result = await useCase.execute(
        buildCommand({ name: 'Some New Name' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(infraError);
      expect(updateSpy).not.toHaveBeenCalled();
      expect(queueAddMock).not.toHaveBeenCalled();
    });

    it('propagates an InfrastructureError from update and does not fire the queue', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to update class group',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'update').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(
        buildCommand({ name: 'Some New Name' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(infraError);
      expect(queueAddMock).not.toHaveBeenCalled();
    });

    it('propagates a class_group_not_found from update (e.g. race condition after findById) and does not fire the queue', async () => {
      const raceError: ClassGroupNotFoundError = {
        kind: 'class_group_not_found',
        by: 'id',
        value: 'class-group-hair-1',
        message: 'Class group not found against class-group-hair-1',
        timestamp: new Date(),
      };
      jest.spyOn(repository, 'update').mockResolvedValueOnce(err(raceError));

      const result = await useCase.execute(
        buildCommand({ name: 'Some New Name' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(raceError);
      expect(queueAddMock).not.toHaveBeenCalled();
    });
  });
});
