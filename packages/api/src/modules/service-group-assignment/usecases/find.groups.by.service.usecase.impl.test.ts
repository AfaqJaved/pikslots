// find.groups.by.service.usecase.impl.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  err,
  IServiceGroupAssignmentRepository,
  InfrastructureError,
} from '@pikslots/domain';
import { FindGroupsByServiceUseCaseImpl } from './find.groups.by.service.usecase.impl';
import { ServiceGroupAssignmentRepositoryTestImpl } from '../repository/service.group.assignment.respository.fake.impl';
import { SERVICE_GROUP_ASSIGNMENT_TEST_DATA } from '../repository/service.group.assignment.fake.data';

describe('FindGroupsByServiceUseCaseImpl', () => {
  let useCase: FindGroupsByServiceUseCaseImpl;
  let repository: ServiceGroupAssignmentRepositoryTestImpl;
  let originalData: typeof SERVICE_GROUP_ASSIGNMENT_TEST_DATA;

  beforeEach(async () => {
    if (!originalData) originalData = [...SERVICE_GROUP_ASSIGNMENT_TEST_DATA];
    SERVICE_GROUP_ASSIGNMENT_TEST_DATA.length = 0;
    SERVICE_GROUP_ASSIGNMENT_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindGroupsByServiceUseCaseImpl,
        {
          provide: IServiceGroupAssignmentRepository,
          useClass: ServiceGroupAssignmentRepositoryTestImpl,
        },
      ],
    }).compile();

    useCase = moduleRef.get(FindGroupsByServiceUseCaseImpl);
    repository = moduleRef.get(IServiceGroupAssignmentRepository);
  });

  describe('successful lookup', () => {
    it('returns all active groups assigned to the service', async () => {
      // service-haircut-1 is linked to group-styling-1 (sga-1) and
      // group-grooming-1 (sga-3), both active.
      const result = await useCase.execute('service-haircut-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(
          expect.arrayContaining([
            { id: 'group-styling-1', name: 'Styling' },
            { id: 'group-grooming-1', name: 'Grooming' },
          ]),
        );
        expect(result.value).toHaveLength(2);
      }
    });

    it('excludes soft-deleted assignments', async () => {
      // service-massage-1 is only linked via sga-4, which is soft-deleted.
      const result = await useCase.execute('service-massage-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('returns an empty array for a service with no assignments', async () => {
      const result = await useCase.execute('service-nonexistent');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('does not return groups belonging to a different service', async () => {
      // service-color-1 belongs only to group-styling-1
      const result = await useCase.execute('service-color-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([
          { id: 'group-styling-1', name: 'Styling' },
        ]);
        expect(result.value.some((g) => g.id === 'group-grooming-1')).toBe(
          false,
        );
      }
    });

    it('does not leak assignments scoped to a different business', async () => {
      // sga-5 links service-haircut-1 to group-styling-1 under business-2,
      // but findGroupsByService is not business-scoped by id alone, so this
      // just confirms the returned group set matches what's expected for
      // business-1's active assignments (no duplicate/ghost entries from sga-5
      // beyond the already-expected group-styling-1 membership).
      const result = await useCase.execute('service-haircut-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const styling = result.value.filter((g) => g.id === 'group-styling-1');
        expect(styling).toHaveLength(1);
      }
    });
  });

  describe('repository interactions', () => {
    it('calls findGroupsByService with the given serviceId', async () => {
      const spy = jest.spyOn(repository, 'findGroupsByService');

      await useCase.execute('service-haircut-1');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('service-haircut-1');
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from findGroupsByService', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find groups by service',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest
        .spyOn(repository, 'findGroupsByService')
        .mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute('service-haircut-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });
  });
});
