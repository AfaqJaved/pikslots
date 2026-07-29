import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import {
  IServiceGroupRepository,
  InfrastructureError,
  ServiceGroupAlreadyExistsInBusinessError,
  err,
} from '@pikslots/domain';
import type { RegisterServiceGroupCommand } from '@pikslots/domain';

import { RegisterServiceGroupUseCaseImpl } from './register.service.group.usecase.impl';
import { ServiceGroupRepositoryTestImpl } from '../repository/service.group.repository.fake.impl';
import { SERVICE_GROUP_TEST_DATA } from '../repository/service.group.test.data';
import { PIKSLOT_EVENTS } from 'src/shared/queue/jobs/pikslot.events';

jest.mock('uuid', () => ({
  v7: () => 'mock-generated-id',
}));

function buildCommand(
  overrides: Partial<RegisterServiceGroupCommand> = {},
): RegisterServiceGroupCommand {
  return {
    name: 'New Service Group',
    businessId: 'business-1',
    associatedServices: [],
    createdBy: 'user-owner-1',
    ...overrides,
  };
}

describe('RegisterServiceGroupUseCaseImpl', () => {
  let useCase: RegisterServiceGroupUseCaseImpl;
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
        RegisterServiceGroupUseCaseImpl,
        {
          provide: IServiceGroupRepository,
          useValue: repository,
        },
        {
          provide: QUEUE_TOKEN,
          useValue: {
            add: queueAddMock,
          },
        },
      ],
    }).compile();

    useCase = module.get(RegisterServiceGroupUseCaseImpl);
  });

  // ──────────────────────────────────────────────────────────────
  // Duplicate Name
  // ──────────────────────────────────────────────────────────────

  describe('duplicate name', () => {
    it('returns service_group_already_exists when an active group with the same name exists in the same business', async () => {
      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(
        buildCommand({
          name: 'Haircut Services',
          businessId: 'business-1',
        }),
      );

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error.kind).toBe('service_group_already_exists');

        expect(
          (result.error as ServiceGroupAlreadyExistsInBusinessError).name,
        ).toBe('Haircut Services');
      }

      expect(saveSpy).not.toHaveBeenCalled();
      expect(queueAddMock).not.toHaveBeenCalled();
    });

    it('allows the same name when it only exists in another business', async () => {
      const result = await useCase.execute(
        buildCommand({
          name: 'Massage Services',
          businessId: 'business-1',
        }),
      );

      expect(result.ok).toBe(true);
    });

    it('allows reusing the name of a soft-deleted service group', async () => {
      const result = await useCase.execute(
        buildCommand({
          name: 'Retired Group',
          businessId: 'business-1',
        }),
      );

      expect(result.ok).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Successful registration
  // ──────────────────────────────────────────────────────────────

  describe('successful registration', () => {
    it('creates and persists a new service group', async () => {
      const result = await useCase.execute(
        buildCommand({
          name: 'Spa Services',
        }),
      );

      expect(result.ok).toBe(true);

      const persisted = SERVICE_GROUP_TEST_DATA.find(
        (g) => g.id === 'mock-generated-id',
      );

      expect(persisted).toBeDefined();
      expect(persisted?.name).toBe('Spa Services');
      expect(persisted?.businessId).toBe('business-1');
      expect(persisted?.createdBy).toBe('user-owner-1');
      expect(persisted?.updatedBy).toBe('user-owner-1');

      expect(queueAddMock).not.toHaveBeenCalled();
    });

    it('returns success', async () => {
      const result = await useCase.execute(buildCommand());

      expect(result).toEqual({
        ok: true,
        value: {
          message: 'success',
        },
      });
    });

    it('creates the entity using the generated uuid', async () => {
      const saveSpy = jest.spyOn(repository, 'save');

      await useCase.execute(buildCommand());

      const entity = saveSpy.mock.calls[0][0];

      expect(entity.id).toBe('mock-generated-id');
      expect(entity.name).toBe('New Service Group');
      expect(entity.businessId).toBe('business-1');
      expect(entity.createdBy).toBe('user-owner-1');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Repository interactions
  // ──────────────────────────────────────────────────────────────

  describe('repository interactions', () => {
    it('calls existsByName with command.name and command.businessId', async () => {
      const existsByNameSpy = jest.spyOn(repository, 'existsByName');

      await useCase.execute(
        buildCommand({
          name: 'Luxury Services',
          businessId: 'business-9',
        }),
      );

      expect(existsByNameSpy).toHaveBeenCalledWith(
        'Luxury Services',
        'business-9',
      );
    });

    it('calls save exactly once', async () => {
      const saveSpy = jest.spyOn(repository, 'save');

      await useCase.execute(buildCommand());

      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('passes a newly-created ServiceGroup to save()', async () => {
      const saveSpy = jest.spyOn(repository, 'save');

      await useCase.execute(
        buildCommand({
          name: 'Premium Services',
          businessId: 'business-7',
          createdBy: 'user-admin-1',
        }),
      );

      const saved = saveSpy.mock.calls[0][0];

      expect(saved.id).toBe('mock-generated-id');
      expect(saved.name).toBe('Premium Services');
      expect(saved.businessId).toBe('business-7');
      expect(saved.createdBy).toBe('user-admin-1');
      expect(saved.updatedBy).toBe('user-admin-1');
      expect(saved.isDeleted).toBe(false);
      expect(saved.deletedAt).toBeNull();
      expect(saved.deletedBy).toBeNull();
    });

    it('checks name uniqueness before attempting to save', async () => {
      const existsSpy = jest.spyOn(repository, 'existsByName');
      const saveSpy = jest.spyOn(repository, 'save');

      await useCase.execute(buildCommand());

      expect(existsSpy.mock.invocationCallOrder[0]).toBeLessThan(
        saveSpy.mock.invocationCallOrder[0],
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Queue behaviour
  // ──────────────────────────────────────────────────────────────

  describe('queue interaction', () => {
    it('does not fire the queue when associatedServices is empty', async () => {
      await useCase.execute(
        buildCommand({
          associatedServices: [],
        }),
      );

      expect(queueAddMock).not.toHaveBeenCalled();
    });

    it('fires the queue when associatedServices contains services', async () => {
      const result = await useCase.execute(
        buildCommand({
          associatedServices: ['service-1', 'service-2'],
        }),
      );

      expect(result.ok).toBe(true);

      expect(queueAddMock).toHaveBeenCalledTimes(1);
    });

    it('fires the queue with the correct payload', async () => {
      await useCase.execute(
        buildCommand({
          businessId: 'business-1',
          associatedServices: ['service-a', 'service-b', 'service-c'],
          createdBy: 'user-admin-9',
        }),
      );

      expect(queueAddMock).toHaveBeenCalledWith(
        PIKSLOT_EVENTS.SERVICE_GROUP_ASSIGNMENT.SYNC_SERVICE_GROUP_SERVICES,
        {
          serviceGroupId: 'mock-generated-id',
          serviceIds: ['service-a', 'service-b', 'service-c'],
          businessId: 'business-1',
          assignedBy: 'user-admin-9',
        },
      );
    });

    it('persists the group before firing the queue', async () => {
      const saveSpy = jest.spyOn(repository, 'save');

      await useCase.execute(
        buildCommand({
          associatedServices: ['service-1'],
        }),
      );

      expect(saveSpy.mock.invocationCallOrder[0]).toBeLessThan(
        queueAddMock.mock.invocationCallOrder[0],
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Persistence integrity
  // ──────────────────────────────────────────────────────────────

  describe('persistence integrity', () => {
    it('adds exactly one new service group', async () => {
      const before = SERVICE_GROUP_TEST_DATA.length;

      await useCase.execute(
        buildCommand({
          name: 'Waxing Services',
        }),
      );

      expect(SERVICE_GROUP_TEST_DATA).toHaveLength(before + 1);
    });

    it('does not modify existing service groups', async () => {
      const before = SERVICE_GROUP_TEST_DATA.find(
        (g) => g.id === 'service-group-haircut-1',
      );

      await useCase.execute(
        buildCommand({
          name: 'Threading Services',
        }),
      );

      const after = SERVICE_GROUP_TEST_DATA.find(
        (g) => g.id === 'service-group-haircut-1',
      );

      expect(after?.id).toBe(before?.id);
      expect(after?.name).toBe(before?.name);
      expect(after?.businessId).toBe(before?.businessId);
      expect(after?.createdAt).toEqual(before?.createdAt);
      expect(after?.createdBy).toBe(before?.createdBy);
      expect(after?.updatedAt).toEqual(before?.updatedAt);
      expect(after?.updatedBy).toBe(before?.updatedBy);
    });

    it('stores the newly-created group as active', async () => {
      await useCase.execute(
        buildCommand({
          name: 'Facial Services',
        }),
      );

      const created = SERVICE_GROUP_TEST_DATA.find(
        (g) => g.id === 'mock-generated-id',
      );

      expect(created?.isDeleted).toBe(false);
      expect(created?.deletedAt).toBeNull();
      expect(created?.deletedBy).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Repository failures
  // ──────────────────────────────────────────────────────────────

  describe('repository failures', () => {
    it('propagates InfrastructureError from existsByName and does not save or fire the queue', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to check existing service group',
        timestamp: new Date(),
        cause: new Error('boom'),
      };

      jest
        .spyOn(repository, 'existsByName')
        .mockResolvedValueOnce(err(infraError));

      const saveSpy = jest.spyOn(repository, 'save');

      const result = await useCase.execute(buildCommand());

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBe(infraError);
      }

      expect(saveSpy).not.toHaveBeenCalled();
      expect(queueAddMock).not.toHaveBeenCalled();
    });

    it('propagates InfrastructureError from save and does not fire the queue', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to save service group',
        timestamp: new Date(),
        cause: new Error('boom'),
      };

      jest.spyOn(repository, 'save').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute(
        buildCommand({
          name: 'Luxury Spa',
        }),
      );

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBe(infraError);
      }

      expect(queueAddMock).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Edge cases
  // ──────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('allows creating multiple unique service groups in the same business', async () => {
      const first = await useCase.execute(
        buildCommand({
          name: 'Service Group A',
        }),
      );

      expect(first.ok).toBe(true);

      const second = await useCase.execute(
        buildCommand({
          name: 'Service Group B',
        }),
      );

      expect(second.ok).toBe(true);

      expect(
        SERVICE_GROUP_TEST_DATA.filter(
          (g) =>
            g.businessId === 'business-1' &&
            (g.name === 'Service Group A' || g.name === 'Service Group B'),
        ),
      ).toHaveLength(2);
    });

    it('does not persist anything when the name already exists', async () => {
      const before = SERVICE_GROUP_TEST_DATA.length;

      await useCase.execute(
        buildCommand({
          name: 'Haircut Services',
          businessId: 'business-1',
        }),
      );

      expect(SERVICE_GROUP_TEST_DATA).toHaveLength(before);
    });

    it('creates audit fields from command.createdBy', async () => {
      await useCase.execute(
        buildCommand({
          createdBy: 'user-admin-99',
        }),
      );

      const created = SERVICE_GROUP_TEST_DATA.find(
        (g) => g.id === 'mock-generated-id',
      );

      expect(created?.createdBy).toBe('user-admin-99');
      expect(created?.updatedBy).toBe('user-admin-99');
    });

    it('creates the group in the requested business', async () => {
      await useCase.execute(
        buildCommand({
          businessId: 'business-99',
        }),
      );

      const created = SERVICE_GROUP_TEST_DATA.find(
        (g) => g.id === 'mock-generated-id',
      );

      expect(created?.businessId).toBe('business-99');
    });
  });
});
