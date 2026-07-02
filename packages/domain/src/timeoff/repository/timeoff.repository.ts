import type { InfrastructureError, Result } from '../../shared';
import type { TimeOffNotFound } from '../errors';
import type { Timeoff } from '../timeoff.entity';

export interface TimeOffRepository {
  save(timeoff: Timeoff): Promise<Result<void, InfrastructureError>>;
  findAll(
    user_id: string,
  ): Promise<Result<Timeoff[] | null, TimeOffNotFound | InfrastructureError>>;
  find(id: string): Promise<Result<Timeoff, TimeOffNotFound | InfrastructureError>>;
  update(timeoff: Timeoff): Promise<Result<void, TimeOffNotFound | InfrastructureError>>;
  delete(id: string): Promise<Result<void, TimeOffNotFound | InfrastructureError>>;
}

export const ITimeoffRepository = Symbol('ITimeoffRepository');
