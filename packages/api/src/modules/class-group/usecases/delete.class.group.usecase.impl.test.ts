import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassGroupNotFoundError,
  IClassGroupRepository,
  InfrastructureError,
  err,
} from '@pikslots/domain';
import { ClassGroupRepositoryTestImpl } from '../repository/class.group.repository.fake.impl';
import { DeleteClassGroupUseCaseImpl } from './delete.class.group.usecase.impl';
import { CLASS_GROUP_TEST_DATA } from '../repository/class.group.test.data';

describe('DeleteClassGroupUseCaseImpl', () => {
  let useCase: DeleteClassGroupUseCaseImpl;
  let repository: ClassGroupRepositoryTestImpl;

  let originalData: typeof CLASS_GROUP_TEST_DATA;

  beforeEach(async () => {
    if (!originalData) originalData = [...CLASS_GROUP_TEST_DATA];
    CLASS_GROUP_TEST_DATA.length = 0;
    CLASS_GROUP_TEST_DATA.push(...originalData);

    repository = new ClassGroupRepositoryTestImpl(CLASS_GROUP_TEST_DATA);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteClassGroupUseCaseImpl,
        { provide: IClassGroupRepository, useValue: repository },
      ],
    }).compile();

    useCase = module.get(DeleteClassGroupUseCaseImpl);
  });

  // ── Happy path ──────────────────────────────────────────────────────────

  it('deletes an existing, non-deleted class group', async () => {
    const result = await useCase.execute('class-group-hair-1');

    expect(result.ok).toBe(true);

    const stillThere = CLASS_GROUP_TEST_DATA.find(
      (g) => g.id === 'class-group-hair-1',
    );
    expect(stillThere).toBeUndefined();
  });

  // ── Not found ───────────────────────────────────────────────────────────

  it('returns class_group_not_found when the id does not exist at all', async () => {
    const result = await useCase.execute('class-group-does-not-exist');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('class_group_not_found');
    }
  });

  it('returns class_group_not_found when the group is already soft-deleted', async () => {
    // class-group-old-1 is soft-deleted in the fixture data, so findById
    // (which filters is_deleted = false) reports it as not found — same as a
    // truly missing id, from this use case's point of view.
    const result = await useCase.execute('class-group-old-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('class_group_not_found');
    }
  });

  it('does not call repository.delete when the group is not found', async () => {
    const deleteSpy = jest.spyOn(repository, 'delete');

    await useCase.execute('class-group-does-not-exist');

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  // ── Repository interaction ─────────────────────────────────────────────

  it('calls findById with the given id', async () => {
    const findByIdSpy = jest.spyOn(repository, 'findById');

    await useCase.execute('class-group-hair-1');

    expect(findByIdSpy).toHaveBeenCalledWith('class-group-hair-1');
  });

  it('calls delete with the given id after confirming existence', async () => {
    const deleteSpy = jest.spyOn(repository, 'delete');

    await useCase.execute('class-group-hair-1');

    expect(deleteSpy).toHaveBeenCalledWith('class-group-hair-1');
  });

  // ── Repository failure propagation ─────────────────────────────────────

  it('propagates an infrastructure error from findById untouched', async () => {
    const infraError: InfrastructureError = {
      kind: 'infrastructure',
      message: 'Failed to find class group by id',
      timestamp: new Date(),
      cause: new Error('connection reset'),
    };
    jest.spyOn(repository, 'findById').mockResolvedValueOnce(err(infraError));

    const result = await useCase.execute('class-group-hair-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(infraError);
    }
  });

  it('does not call delete when findById fails', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValueOnce(
      err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find class group by id',
        timestamp: new Date(),
        cause: new Error('boom'),
      }),
    );
    const deleteSpy = jest.spyOn(repository, 'delete');

    await useCase.execute('class-group-hair-1');

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('propagates an infrastructure error from delete untouched', async () => {
    const infraError: InfrastructureError = {
      kind: 'infrastructure',
      message: 'Failed to delete class group',
      timestamp: new Date(),
      cause: new Error('deadlock'),
    };
    jest.spyOn(repository, 'delete').mockResolvedValueOnce(err(infraError));

    const result = await useCase.execute('class-group-hair-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(infraError);
    }
  });

  it('propagates class_group_not_found if delete races and the row disappears between check and delete', async () => {
    // Edge case: findById reports found, but by the time delete() runs the
    // row is gone (e.g. a concurrent delete). The real repo's delete() has
    // its own not-found branch for exactly this scenario — locking in that
    // the use case just forwards it rather than swallowing or retrying.
    const raceError: ClassGroupNotFoundError = {
      kind: 'class_group_not_found',
      by: 'id',
      value: 'class-group-hair-1',
      message: 'Class group not found against class-group-hair-1',
      timestamp: new Date(),
    };
    jest.spyOn(repository, 'delete').mockResolvedValueOnce(err(raceError));

    const result = await useCase.execute('class-group-hair-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(raceError);
    }
  });
});
