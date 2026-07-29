import { Test, TestingModule } from '@nestjs/testing';
import {
  IClassGroupRepository,
  InfrastructureError,
  err,
} from '@pikslots/domain';
import { ClassGroupRepositoryTestImpl } from '../repository/class.group.repository.fake.impl';
import { CLASS_GROUP_TEST_DATA } from '../repository/class.group.test.data';
import { FindAllClassGroupsByBusinessUseCaseImpl } from './find.all.class.groups.by.business.usecase.impl';

describe('FindAllClassGroupsByBusinessUseCaseImpl', () => {
  let useCase: FindAllClassGroupsByBusinessUseCaseImpl;
  let repository: ClassGroupRepositoryTestImpl;
  let originalData: typeof CLASS_GROUP_TEST_DATA;

  beforeEach(async () => {
    if (!originalData) originalData = [...CLASS_GROUP_TEST_DATA];
    CLASS_GROUP_TEST_DATA.length = 0;
    CLASS_GROUP_TEST_DATA.push(...originalData);

    repository = new ClassGroupRepositoryTestImpl(CLASS_GROUP_TEST_DATA);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllClassGroupsByBusinessUseCaseImpl,
        { provide: IClassGroupRepository, useValue: repository },
      ],
    }).compile();

    useCase = module.get(FindAllClassGroupsByBusinessUseCaseImpl);
  });

  // ── Successful lookups ──────────────────────────────────────────────────

  describe('successful lookup', () => {
    it('returns all active, non-deleted class groups for a business', async () => {
      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((g) => g.id);
        expect(ids).toContain('class-group-hair-1');
        expect(ids).toContain('class-group-nails-1');
        expect(ids).toHaveLength(2);
      }
    });

    it('excludes soft-deleted class groups', async () => {
      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((g) => g.id);
        // class-group-old-1 is soft-deleted, also in business-1
        expect(ids).not.toContain('class-group-old-1');
      }
    });

    it('does not include class groups belonging to a different business', async () => {
      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((g) => g.id);
        expect(ids).not.toContain('class-group-hair-2'); // business-2
        expect(ids).not.toContain('class-group-spa-1'); // business-3
      }
    });

    it('returns an empty array (ok, not an error) for a business with no class groups', async () => {
      const result = await useCase.execute('business-with-no-groups');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('returns only the single group for a business that has exactly one', async () => {
      const result = await useCase.execute('business-2');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].id).toBe('class-group-hair-2');
      }
    });
  });

  // ── Repository interaction ─────────────────────────────────────────────

  describe('repository interaction', () => {
    it('calls findAllByBusiness with the given businessId', async () => {
      const findAllSpy = jest.spyOn(repository, 'findAllByBusiness');

      await useCase.execute('business-1');

      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(findAllSpy).toHaveBeenCalledWith('business-1');
    });
  });

  // ── Repository failure propagation ─────────────────────────────────────

  describe('repository failure', () => {
    it('propagates an InfrastructureError from findAllByBusiness untouched', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Failed to find class groups by business',
        timestamp: new Date(),
        cause: new Error('connection lost'),
      };
      jest
        .spyOn(repository, 'findAllByBusiness')
        .mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(infraError);
      }
    });
  });
});
