import { Test, TestingModule } from '@nestjs/testing';
import {
  err,
  IClassGroupAssignmentRepository,
  InfrastructureError,
} from '@pikslots/domain';
import { FindClassesByGroupUseCaseImpl } from './find.classes.by.group.usecase.impl';
import { ClassGroupAssignmentRepositoryTestImpl } from '../repository/class.group.assignment.repository.fake.impl';
import { CLASS_GROUP_ASSIGNMENT_TEST_DATA } from '../repository/class.group.assignment.fake.data';

describe('FindClassesByGroupUseCaseImpl', () => {
  let useCase: FindClassesByGroupUseCaseImpl;
  let repository: ClassGroupAssignmentRepositoryTestImpl;
  let originalData: typeof CLASS_GROUP_ASSIGNMENT_TEST_DATA;

  beforeEach(async () => {
    if (!originalData) originalData = [...CLASS_GROUP_ASSIGNMENT_TEST_DATA];
    CLASS_GROUP_ASSIGNMENT_TEST_DATA.length = 0;
    CLASS_GROUP_ASSIGNMENT_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindClassesByGroupUseCaseImpl,
        {
          provide: IClassGroupAssignmentRepository,
          useClass: ClassGroupAssignmentRepositoryTestImpl,
        },
      ],
    }).compile();

    useCase = moduleRef.get(FindClassesByGroupUseCaseImpl);
    repository = moduleRef.get(IClassGroupAssignmentRepository);
  });

  describe('successful lookup', () => {
    it('returns all active classes assigned to the group', async () => {
      const result = await useCase.execute('group-morning-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(
          expect.arrayContaining([
            { id: 'class-yoga-1', title: 'Yoga' },
            { id: 'class-pilates-1', title: 'Pilates' },
          ]),
        );
        expect(result.value).toHaveLength(2);
      }
    });

    it('excludes soft-deleted assignments', async () => {
      const result = await useCase.execute('group-morning-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.some((c) => c.id === 'class-spin-1')).toBe(false);
      }
    });

    it('returns an empty array for a group with no assignments', async () => {
      const result = await useCase.execute('group-nonexistent');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('does not return classes belonging to a different group', async () => {
      const result = await useCase.execute('group-morning-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.some((c) => c.id === 'class-hiit-1')).toBe(false);
      }
    });
  });

  describe('repository interactions', () => {
    it('calls findClassesByGroup with the given classGroupId', async () => {
      const spy = jest.spyOn(repository, 'findClassesByGroup');

      await useCase.execute('group-morning-1');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('group-morning-1');
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from findClassesByGroup', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find classes by group',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest
        .spyOn(repository, 'findClassesByGroup')
        .mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute('group-morning-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });
  });
});
