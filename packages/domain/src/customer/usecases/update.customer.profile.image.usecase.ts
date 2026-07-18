import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { CustomerNotFoundError } from '../errors';
import type { Customer } from '../customer.entity';

export interface UpdateCustomerProfileImageCommand {
  customerId: string;
  profileImageKey: string;
}

export const IUpdateCustomerProfileImageUseCase = Symbol('IUpdateCustomerProfileImageUseCase');

export interface UpdateCustomerProfileImageUseCase {
  execute(
    command: UpdateCustomerProfileImageCommand,
  ): Promise<Result<Customer, CustomerNotFoundError | UnauthorizedError | InfrastructureError>>;
}
