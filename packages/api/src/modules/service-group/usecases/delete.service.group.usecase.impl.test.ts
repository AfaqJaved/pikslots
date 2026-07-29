import { Test, TestingModule } from '@nestjs/testing';
import {
  ServiceGroupNotFoundError,
  IServiceGroupRepository,
  InfrastructureError,
  err,
} from '@pikslots/domain';
import { ServiceGroupRepositoryTestImpl } from '../repository/service.group.repository.fake.impl';
import { SERVICE_GROUP_TEST_DATA } from '../repository/service.group.test.data';
import { DeleteServiceGroupUseCaseImpl } from './delete.service.group.usecase.impl';

describe('DeleteServiceGroupUseCaseImpl', () => {
  let useCase: DeleteServiceGroupUseCaseImpl;
  let repository: ServiceGroupRepositoryTestImpl;

  let originalData: typeof SERVICE_GROUP_TEST_DATA;

  beforeEach(async () => {
    if (!originalData) originalData = [...SERVICE_GROUP_TEST_DATA];
    SERVICE_GROUP_TEST_DATA.length = 0;
    SERVICE_GROUP_TEST_DATA.push(...originalData);

    repository = new ServiceGroupRepositoryTestImpl(SERVICE_GROUP_TEST_DATA);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteServiceGroupUseCaseImpl,
        { provide: IServiceGroupRepository, useValue: repository },
      ],
    }).compile();

    useCase = module.get(DeleteServiceGroupUseCaseImpl);
  });

  // ── Happy path ──────────────────────────────────────────────────────────

  it('deletes an existing, non-deleted service group', async () => {
    const result = await useCase.execute('service-group-haircut-1');

    expect(result.ok).toBe(true);

    const stillThere = SERVICE_GROUP_TEST_DATA.find(
      (g) => g.id === 'service-group-haircut-1',
    );
    expect(stillThere).toBeUndefined();
  });

  // ── Not found ───────────────────────────────────────────────────────────

  it('returns service_group_not_found when the id does not exist at all', async () => {
    const result = await useCase.execute('service-group-does-not-exist');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('service_group_not_found');
    }
  });

  it('returns service_group_not_found when the group is already soft-deleted', async () => {
    // service-group-old-1 is soft-deleted in the fixture data, so findById
    // (which filters is_deleted = false) reports it as not found — same as a
    // truly missing id, from this use case's point of view.
    const result = await useCase.execute('service-group-old-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('service_group_not_found');
    }
  });

  it('does not call repository.delete when the group is not found', async () => {
    const deleteSpy = jest.spyOn(repository, 'delete');

    await useCase.execute('service-group-does-not-exist');

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  // ── Repository interaction ─────────────────────────────────────────────

  it('calls findById with the given id', async () => {
    const findByIdSpy = jest.spyOn(repository, 'findById');

    await useCase.execute('service-group-haircut-1');

    expect(findByIdSpy).toHaveBeenCalledWith('service-group-haircut-1');
  });

  it('calls delete with the given id after confirming existence', async () => {
    const deleteSpy = jest.spyOn(repository, 'delete');

    await useCase.execute('service-group-haircut-1');

    expect(deleteSpy).toHaveBeenCalledWith('service-group-haircut-1');
  });

  // ── Repository failure propagation ─────────────────────────────────────

  it('propagates an infrastructure error from findById untouched', async () => {
    const infraError: InfrastructureError = {
      kind: 'infrastructure',
      message: 'Failed to find service group by id',
      timestamp: new Date(),
      cause: new Error('connection reset'),
    };
    jest.spyOn(repository, 'findById').mockResolvedValueOnce(err(infraError));

    const result = await useCase.execute('service-group-haircut-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(infraError);
    }
  });

  it('does not call delete when findById fails', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValueOnce(
      err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find service group by id',
        timestamp: new Date(),
        cause: new Error('boom'),
      }),
    );
    const deleteSpy = jest.spyOn(repository, 'delete');

    await useCase.execute('service-group-haircut-1');

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('propagates an infrastructure error from delete untouched', async () => {
    const infraError: InfrastructureError = {
      kind: 'infrastructure',
      message: 'Failed to delete service group',
      timestamp: new Date(),
      cause: new Error('deadlock'),
    };
    jest.spyOn(repository, 'delete').mockResolvedValueOnce(err(infraError));

    const result = await useCase.execute('service-group-haircut-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(infraError);
    }
  });

  it('propagates service_group_not_found if delete races and the row disappears between check and delete', async () => {
    // Edge case: findById reports found, but by the time delete() runs the
    // row is gone (e.g. a concurrent delete). The real repo's delete() has
    // its own not-found branch for exactly this scenario — locking in that
    // the use case just forwards it rather than swallowing or retrying.
    const raceError: ServiceGroupNotFoundError = {
      kind: 'service_group_not_found',
      by: 'id',
      value: 'service-group-haircut-1',
      message: 'Service group not found against service-group-haircut-1',
      timestamp: new Date(),
    };
    jest.spyOn(repository, 'delete').mockResolvedValueOnce(err(raceError));

    const result = await useCase.execute('service-group-haircut-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(raceError);
    }
  });
});
