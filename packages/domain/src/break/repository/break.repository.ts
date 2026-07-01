import type { Result } from '../../shared/result';
import type { InfrastructureError } from '../../shared';
import type { BreakNotFoundError, BreakOverlapError } from '../errors/index';
import type { Break } from '../break.entity';
import type { CreateBreakInput } from '../break.entity';

export interface BreakRepository {
  /**
   * Persists a new break. The caller (use-case) is responsible for overlap
   * checking before calling this — this method does a raw insert.
   */
  save(input: CreateBreakInput): Promise<Result<Break, InfrastructureError>>;

  /**
   * Returns all breaks for a given user, ordered by day then start time.
   * Returns an empty array (not an error) when the user has no breaks.
   */
  findAllByUserId(userId: string): Promise<Result<Break[], InfrastructureError>>;

  /**
   * Returns the break with the given id, or null if it does not exist.
   * Only returns BreakNotFoundError for infrastructure failures that
   * prevented the lookup — not for "not found" (that's the null).
   */
  findById(id: string): Promise<Result<Break | null, BreakNotFoundError | InfrastructureError>>;

  /**
   * Deletes a break by id. The caller (use-case) is responsible for
   * ownership and permission checks before calling this.
   */
  delete(id: string): Promise<Result<void, BreakNotFoundError | InfrastructureError>>;

  /**
   * Persists updated time window for an existing break.
   * The caller (use-case) is responsible for overlap and ownership
   * checks before calling this.
   */
  update(break_: Break): Promise<Result<Break, BreakNotFoundError | InfrastructureError>>;
}

export const IBreakRepository = Symbol('IBreakRepository');
