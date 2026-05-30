import type { InfrastructureError, Result } from '../../shared';
import type { BusinessAlreadyExistsError } from '../errors';
import type { BusinessIndustry } from '../types/';

export interface CreateBusinessCommand {
  ownerId: string;
  slug: string;
  name: string;
  industry: BusinessIndustry;
  defaultTimeZone: string;
}

export const IRegisterBusinessUseCase = Symbol('IRegisterBusinessUseCase');

export interface RegisterBusinessUseCase {
  execute(
    command: CreateBusinessCommand,
  ): Promise<Result<{ message: 'success' }, BusinessAlreadyExistsError | InfrastructureError>>;
}
