// timeoff.repository.fake.impl.ts
import {
  err,
  InfrastructureError,
  ok,
  Result,
  Timeoff,
  TimeOffNotFound,
  TimeOffRepository,
} from '@pikslots/domain';
import { TIMEOFF_TEST_DATA } from './timeoff.test.data';

/**
 * In-memory fake for TimeOffRepository, used for unit testing use cases.
 * Mirrors TimeOffRepositoryImpl's real query semantics exactly, including:
 * - findAllByUser does NOT filter isDeleted (matches the real impl's SQL,
 *   which has no `is_deleted` clause on that query — see flag in usage).
 * - findById filters isDeleted (matches `where('is_deleted', '=', false)`).
 * - update filters isDeleted and fails with not-found if no row matched.
 * - delete performs a hard delete (matches `deleteFrom`, not a soft-delete
 *   despite the entity carrying isDeleted/deletedAt/deletedBy fields).
 */
export class TimeOffRepositoryTestImpl implements TimeOffRepository {
  async save(timeoff: Timeoff): Promise<Result<void, InfrastructureError>> {
    await Promise.resolve('');
    TIMEOFF_TEST_DATA.push(timeoff);
    return ok(undefined);
  }

  async findAllByUser(
    userId: string,
    businessId: string,
  ): Promise<Result<Timeoff[], InfrastructureError>> {
    await Promise.resolve('');
    const rows = TIMEOFF_TEST_DATA.filter(
      (t) => t.userId === userId && t.businessId === businessId,
    );
    return ok(rows);
  }

  async findById(
    id: string,
  ): Promise<Result<Timeoff, TimeOffNotFound | InfrastructureError>> {
    await Promise.resolve('');
    const found = TIMEOFF_TEST_DATA.find((t) => t.id === id && !t.isDeleted);
    if (!found) {
      return err<TimeOffNotFound>({
        kind: 'timeoff_not_found',
        message: 'Timeoff not found',
        by: 'id',
        timestamp: new Date(),
        value: id,
      });
    }
    return ok(found);
  }

  async update(
    timeoff: Timeoff,
  ): Promise<Result<void, TimeOffNotFound | InfrastructureError>> {
    await Promise.resolve('');
    const index = TIMEOFF_TEST_DATA.findIndex(
      (t) => t.id === timeoff.id && !t.isDeleted,
    );
    if (index === -1) {
      return err<TimeOffNotFound>({
        kind: 'timeoff_not_found',
        message: 'Timeoff not found',
        by: 'id',
        timestamp: new Date(),
        value: null,
      });
    }
    TIMEOFF_TEST_DATA[index] = timeoff;
    return ok(undefined);
  }

  async delete(
    id: string,
  ): Promise<Result<void, TimeOffNotFound | InfrastructureError>> {
    await Promise.resolve('');
    const index = TIMEOFF_TEST_DATA.findIndex((t) => t.id === id);
    if (index === -1) {
      return err<TimeOffNotFound>({
        kind: 'timeoff_not_found',
        by: 'id',
        value: id,
        message: `Timeoff not found against ${id}`,
        timestamp: new Date(),
      });
    }
    TIMEOFF_TEST_DATA.splice(index, 1);
    return ok(undefined);
  }
}
