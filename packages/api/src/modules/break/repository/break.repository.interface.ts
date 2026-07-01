import type {
  Break,
  BreakNotFoundError,
  CreateBreakInput,
  InfrastructureError,
  Result,
} from '@pikslots/domain';

export interface BreakRepository {
  save(input: CreateBreakInput): Promise<Result<Break, InfrastructureError>>;

  findAllByUserId(
    userId: string,
  ): Promise<Result<Break[], InfrastructureError>>;

  findById(
    id: string,
  ): Promise<Result<Break | null, BreakNotFoundError | InfrastructureError>>;

  delete(
    id: string,
  ): Promise<Result<void, BreakNotFoundError | InfrastructureError>>;

  update(
    break_: Break,
  ): Promise<Result<Break, BreakNotFoundError | InfrastructureError>>;
}

export const IBreakRepository = Symbol('IBreakRepository');
