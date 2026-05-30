import type { InfrastructureError, Result } from '../../shared';
import type { BusinessNotFoundError } from '../errors';
import type { Business, SupportedCurrencies } from '../business.entity';

export interface UpdateBusinessLocationCommand {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  currency: SupportedCurrencies;
}

export const IUpdateBusinessLocationUseCase = Symbol('IUpdateBusinessLocationUseCase');

export interface UpdateBusinessLocationUseCase {
  execute(
    command: UpdateBusinessLocationCommand,
  ): Promise<Result<Business, BusinessNotFoundError | InfrastructureError>>;
}
