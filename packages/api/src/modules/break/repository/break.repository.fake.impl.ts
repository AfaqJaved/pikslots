import {
  Break,
  BreakNotFoundError,
  BreakRepository,
  err,
  InfrastructureError,
  ok,
  Result,
  WeekDay,
} from '@pikslots/domain';
import { BREAK_TEST_DATA } from './break.test.data';

export class BreakRepositoryTestImpl implements BreakRepository {
  async save(breakEntity: Break): Promise<Result<void, InfrastructureError>> {
    try {
      await Promise.resolve('');

      BREAK_TEST_DATA.push(breakEntity);
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save break',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<Result<Break | null, InfrastructureError>> {
    await Promise.resolve('');
    const breakFound = BREAK_TEST_DATA.filter((item) => item.id === id)[0];

    if (!breakFound) return ok(null);

    return ok(breakFound);
  }

  async findAllByUser(
    userId: string,
  ): Promise<Result<Break[], InfrastructureError>> {
    await Promise.resolve('');
    const breaksFound = BREAK_TEST_DATA.filter(
      (item) => item.userId === userId,
    );

    return ok(breaksFound);
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<Break[], InfrastructureError>> {
    await Promise.resolve('');
    const BreaksFound = BREAK_TEST_DATA.filter(
      (item) => item.businessId === businessId,
    );
    return ok(BreaksFound);
  }

  async findAllByUserAndDay(
    userId: string,
    day: WeekDay,
  ): Promise<Result<Break[], InfrastructureError>> {
    await Promise.resolve('');
    const BreaksFound = BREAK_TEST_DATA.filter(
      (item) => item.userId === userId && item.day === day,
    );
    return ok(BreaksFound);
  }

  async update(
    breakEntity: Break,
  ): Promise<Result<void, BreakNotFoundError | InfrastructureError>> {
    await Promise.resolve('');
    const index = BREAK_TEST_DATA.findIndex(
      (item) => item.id === breakEntity.id,
    );
    if (index === -1) {
      return err<BreakNotFoundError>({
        kind: 'break_not_found',
        by: 'id',
        value: breakEntity.id,
        message: 'Break not found',
        timestamp: new Date(),
      });
    }
    BREAK_TEST_DATA[index] = breakEntity;
    return ok(undefined);
  }

  async delete(
    id: string,
  ): Promise<Result<void, BreakNotFoundError | InfrastructureError>> {
    await Promise.resolve('');
    const index = BREAK_TEST_DATA.findIndex((item) => item.id === id);
    if (index === -1) {
      return err<BreakNotFoundError>({
        kind: 'break_not_found',
        by: 'id',
        value: id,
        message: 'Break not found',
        timestamp: new Date(),
      });
    }
    BREAK_TEST_DATA.splice(index, 1);
    return ok(undefined);
  }

  async hasConflict(
    userId: string,
    day: WeekDay,
    startTime: string,
    endTime: string,
    excludeBreakId?: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    await Promise.resolve('');
    const hasConflict = BREAK_TEST_DATA.some((item) => {
      if (item.userId !== userId || item.day !== day) {
        return false;
      }
      if (excludeBreakId && item.id === excludeBreakId) {
        return false;
      }
      return !(item.endTime <= startTime || item.startTime >= endTime);
    });
    return ok(hasConflict);
  }
}
