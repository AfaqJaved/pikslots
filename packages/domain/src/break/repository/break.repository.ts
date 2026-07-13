import type { InfrastructureError, Result, WeekDay } from '../../shared';
import type { BreakNotFoundError, BreakConflictError } from '../errors';
import type { Break } from '../break.entity';

export interface BreakRepository {
  save(breakEntity: Break): Promise<Result<void, InfrastructureError>>;
  findById(id: string): Promise<Result<Break | null, InfrastructureError>>;
  findAllByUser(userId: string): Promise<Result<Break[], InfrastructureError>>;
  findAllByBusiness(businessId: string): Promise<Result<Break[], InfrastructureError>>;
  findAllByUserAndDay(userId: string, day: WeekDay): Promise<Result<Break[], InfrastructureError>>;
  update(breakEntity: Break): Promise<Result<void, BreakNotFoundError | InfrastructureError>>;
  delete(id: string): Promise<Result<void, BreakNotFoundError | InfrastructureError>>;
  hasConflict(
    userId: string,
    day: WeekDay,
    startTime: string,
    endTime: string,
    excludeBreakId?: string,
  ): Promise<Result<boolean, InfrastructureError>>;
}

export const IBreakRepository = Symbol('IBreakRepository');
