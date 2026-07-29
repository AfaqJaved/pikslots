import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import {
  ServiceGroupAlreadyExistsInBusinessError,
  ServiceGroupNotFoundError,
  IServiceGroupRepository,
  InfrastructureError,
  err,
} from '@pikslots/domain';
import type { EditServiceGroupCommand } from '@pikslots/domain';
import { ServiceGroupRepositoryTestImpl } from '../repository/service.group.repository.fake.impl';
import { SERVICE_GROUP_TEST_DATA } from '../repository/service.group.test.data';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';
import { EditServiceGroupUseCaseImpl } from './edit.service.group.usecase.impl';

function buildCommand(
  overrides: Partial<EditServiceGroupCommand> = {},
): EditServiceGroupCommand {
  return {
    serviceGroupId: 'service-group-haircut-1',
    name: 'Haircut Services', // matches fixture — "unchanged name" by default
    businessId: 'business-1',
    serviceIds: ['service-1', 'service-2'],
    updatedBy: 'user-owner-1',
    ...overrides,
  };
}

describe('EditServiceGroupUseCaseImpl', () => {
  let useCase: EditServiceGroupUseCaseImpl;
  let repository: ServiceGroupRepositoryTestImpl;
  let queueAddMock: jest.Mock;
  let originalData: typeof SERVICE_GROUP_TEST_DATA;

  const QUEUE_TOKEN = getQueueToken(
    PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_GROUP_SERVICES,
  );

  beforeEach(async () => {
    if (!originalData) originalData = [...SERVICE_GROUP_TEST_DATA];
    SERVICE_GROUP_TEST_DATA.length = 0;
    SERVICE_GROUP_TEST_DATA.push(...originalData);

    repository = new ServiceGroupRepositoryTestImpl(SERVICE_GROUP_TEST_DATA);
    queueAddMock = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditServiceGroupUseCaseImpl,
        { provide: IServiceGroupRepository, useValue: repository },
        { provide: QUEUE_TOKEN, useValue: { add: queueAddMock } },
      ],
    }).compile();

    useCase = module.get(EditServiceGroupUseCaseImpl);
  });

  // ── Not found ───────────────────────────────────────────────────────────

  describe('not found', () => {
    it('returns service_group_not_found when the id does not exist', async () => {
      const result = await useCase.execute(
        buildCommand({ serviceGroupId: 'service-group-nonexistent' }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('service_group_not_found');
        expect((result.error as ServiceGroupNotFoundError).value).toBe(
          'service-group-nonexistent',
        );
      }
    });

    it('returns service_group_not_found for a soft-deleted group', async () => {
      const result = await useCase.execute(
        buildCommand({
          serviceGroupId: 'service-group-old-1',
          name: 'Retired Group',
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('service_group_not_found');
      }
    });

    it('does not call existsByName, update, or the queue when not found', async () => {
      const existsByNameSpy = jest.spyOn(repository, 'existsByName');
      const updateSpy = jest.spyOn(repository, 'update');

      await useCase.execute(
        buildCommand({ serviceGroupId: 'service-group-nonexistent' }),
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
          serviceGroupId: 'service-group-haircut-1',
          name: 'Haircut Services', // same as fixture
        }),
      );

      expect(result.ok).toBe(true);
      expect(existsByNameSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(queueAddMock).toHaveBeenCalledTimes(1);
    });

    it('leaves the persisted group entity untouched when only serviceIds change', async () => {
      const before = SERVICE_GROUP_TEST_DATA.find(
        (g) => g.id === 'service-group-haircut-1',
      );

      await useCase.execute(
        buildCommand({
          serviceGroupId: 'service-group-haircut-1',
          name: 'Haircut Services',
          serviceIds: ['service-9'],
        }),
      );

      const after = SERVICE_GROUP_TEST_DATA.find(
        (g) => g.id === 'service-group-haircut-1',
      );
      expect(after?.name).toBe(before?.name);
      expect(after?.updatedAt).toEqual(before?.updatedAt);
      expect(after?.updatedBy).toBe(before?.updatedBy);
    });
  });

  // ── Name changed — conflict ─────────────────────────────────────────────

  describe('name changed, target name already taken', () => {
    it('returns service_group_already_exists and does not update or fire the queue', async () => {
      const updateSpy = jest.spyOn(repository, 'update');

      // service-group-color-1 already exists in business-1 as "Color Services"
      const result = await useCase.execute(
        buildCommand({
          serviceGroupId: 'service-group-haircut-1',
          name: 'Color Services',
          businessId: 'business-1',
        }),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('service_group_already_exists');
        expect(
          (result.error as ServiceGroupAlreadyExistsInBusinessError).name,
        ).toBe('Color Services');
      }
      expect(updateSpy).not.toHaveBeenCalled();
      expect(queueAddMock).not.toHaveBeenCalled();
    });

    it('does not block renaming to a name already used in a different business', async () => {
      // "Massage Services" only exists in business-3, not business-1 — a
      // genuinely non-colliding rename within business-1.
      const result = await useCase.execute(
        buildCommand({
          serviceGroupId: 'service-group-color-1',
          name: 'Massage Services',
          businessId: 'business-1',
        }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows reusing a name that only exists on a soft-deleted group', async () => {
      // service-group-old-1 ("Retired Group") is soft-deleted, so
      // existsByName (is_deleted = false) does not treat it as a collision.
      const result = await useCase.execute(
        buildCommand({
          serviceGroupId: 'service-group-haircut-1',
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
          serviceGroupId: 'service-group-haircut-1',
          name: 'Hair & Beauty',
          businessId: 'business-1',
          updatedBy: 'user-admin-9',
        }),
      );

      expect(result.ok).toBe(true);

      const persisted = SERVICE_GROUP_TEST_DATA.find(
        (g) => g.id === 'service-group-haircut-1',
      );
      expect(persisted?.name).toBe('Hair & Beauty');
      expect(persisted?.updatedBy).toBe('user-admin-9');
      expect(queueAddMock).toHaveBeenCalledTimes(1);
    });

    it('preserves identity and unrelated fields after rename', async () => {
      const before = SERVICE_GROUP_TEST_DATA.find(
        (g) => g.id === 'service-group-haircut-1',
      );

      await useCase.execute(
        buildCommand({
          serviceGroupId: 'service-group-haircut-1',
          name: 'Renamed',
        }),
      );

      const after = SERVICE_GROUP_TEST_DATA.find(
        (g) => g.id === 'service-group-haircut-1',
      );
      expect(after?.id).toBe(before?.id);
      expect(after?.businessId).toBe(before?.businessId);
      expect(after?.createdAt).toEqual(before?.createdAt);
      expect(after?.createdBy).toBe(before?.createdBy);
    });
  });

  // ── Repository / queue interaction ──────────────────────────────────────

  describe('interactions', () => {
    it('calls findById with command.serviceGroupId', async () => {
      const findByIdSpy = jest.spyOn(repository, 'findById');

      await useCase.execute(
        buildCommand({ serviceGroupId: 'service-group-haircut-1' }),
      );

      expect(findByIdSpy).toHaveBeenCalledWith('service-group-haircut-1');
    });

    it("calls existsByName with command.name and command.businessId, not the found group's businessId", async () => {
      const existsByNameSpy = jest.spyOn(repository, 'existsByName');

      // The group itself belongs to business-1; command declares a different
      // businessId. Locking in current (unchecked-trust) behavior.
      await useCase.execute(
        buildCommand({
          serviceGroupId: 'service-group-haircut-1',
          name: 'New Name',
          businessId: 'business-7',
        }),
      );

      expect(existsByNameSpy).toHaveBeenCalledWith('New Name', 'business-7');
    });

    it('fires the queue with serviceGroupId, serviceIds, businessId, and assignedBy from the command', async () => {
      await useCase.execute(
        buildCommand({
          serviceGroupId: 'service-group-haircut-1',
          name: 'Haircut Services',
          businessId: 'business-1',
          serviceIds: ['service-a', 'service-b'],
          updatedBy: 'user-admin-1',
        }),
      );

      expect(queueAddMock).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_GROUP_SERVICES,
        {
          serviceGroupId: 'service-group-haircut-1',
          serviceIds: ['service-a', 'service-b'],
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
        message: 'Failed to find service group by id',
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
        message: 'Failed to check service group existence by name',
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
        message: 'Failed to update service group',
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

    it('propagates a service_group_not_found from update (e.g. race condition after findById) and does not fire the queue', async () => {
      const raceError: ServiceGroupNotFoundError = {
        kind: 'service_group_not_found',
        by: 'id',
        value: 'service-group-haircut-1',
        message: 'Service group not found against service-group-haircut-1',
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
