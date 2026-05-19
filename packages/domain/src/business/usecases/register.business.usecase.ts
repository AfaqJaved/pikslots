import type { InfrastructureError, Result } from '../../shared';
import type { BusinessAlreadyExistsError } from '../errors';
import type { BusinessIndustry } from '../business.entity';

export interface RegisterBusinessCommand {
  ownerId: string;
  slug: string;
  name: string;
  industry: BusinessIndustry;
  address: string;
  email: string;
  phone?: string;
  description?: string;
  website?: string;
  defaultTimeZone?: string;
  defaultCurrency?: string;
  defaultLanguage?: string;
}

export const IRegisterBusinessUseCase = Symbol('IRegisterBusinessUseCase');

export interface RegisterBusinessUseCase {
  execute(
    command: RegisterBusinessCommand,
  ): Promise<Result<{ message: 'success' }, BusinessAlreadyExistsError | InfrastructureError>>;
}
