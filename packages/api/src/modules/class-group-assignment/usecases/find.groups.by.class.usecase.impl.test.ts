// find.groups.by.class.usecase.impl.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  err,
  IClassGroupAssignmentRepository,
  InfrastructureError,
} from '@pikslots/domain';
import { FindGroupsByClassUseCaseImpl } from './find.groups.by.class.usecase.impl';
import { ClassGroupAssignmentRepositoryTestImpl } from '../repository/class.group.assignment.repository.fake.impl';
import { CLASS_GROUP_ASSIGNMENT_TEST_DATA } from '../repository/class.group.assignment.fake.data';

describe('FindGroupsByClassUseCaseImpl', () => {
  let useCase: FindGroupsByClassUseCaseImpl;
  let repository: ClassGroupAssignmentRepositoryTestImpl;
  let originalData: typeof CLASS_GROUP_ASSIGNMENT_TEST_DATA;

  beforeEach(async () => {
    if (!originalData) originalData = [...CLASS_GROUP_ASSIGNMENT_TEST_DATA];
    CLASS_GROUP_ASSIGNMENT_TEST_DATA.length = 0;
    CLASS_GROUP_ASSIGNMENT_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindGroupsByClassUseCaseImpl,
        {
          provide: IClassGroupAssignmentRepository,
          useClass: ClassGroupAssignmentRepositoryTestImpl,
        },
      ],
    }).compile();

    useCase = moduleRef.get(FindGroupsByClassUseCaseImpl);
    repository = moduleRef.get(IClassGroupAssignmentRepository);
  });

  describe('successful lookup', () => {
    it('returns all active groups assigned to the class', async () => {
      // yoga is assigned to group-morning-1 (cga-1, active).
      // Note: add a yoga <-> evening assignment to test data if you want
      // multi-group coverage here; otherwise this asserts the single-group case.
      const result = await useCase.execute('class-yoga-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([
          { id: 'group-morning-1', name: 'Morning Group' },
        ]);
      }
    });

    it('excludes soft-deleted assignments', async () => {
      // class-spin-1 is only linked via cga-3, which is soft-deleted.
      const result = await useCase.execute('class-spin-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('returns an empty array for a class with no assignments', async () => {
      const result = await useCase.execute('class-nonexistent');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('does not return groups belonging to a different class', async () => {
      // class-hiit-1 belongs only to group-evening-1
      const result = await useCase.execute('class-pilates-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.some((g) => g.id === 'group-evening-1'))
          .toBe()
          .toBe(false);
      }
    });
  });

  describe('repository interactions', () => {
    it('calls findGroupsByClass with the given classId', async () => {
      const spy = jest.spyOn(repository, 'findGroupsByClass');

      await useCase.execute('class-yoga-1');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('class-yoga-1');
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from findGroupsByClass', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find groups by class',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest
        .spyOn(repository, 'findGroupsByClass')
        .mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute('class-yoga-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });
  });
});
