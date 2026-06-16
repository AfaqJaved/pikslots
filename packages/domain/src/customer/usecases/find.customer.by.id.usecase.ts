import type { InfrastructureError, Result, UnauthorizedError } from '../../shared';
import type { CustomerNotFoundError } from '../errors';
import type { CustomerProps } from '../customer.entity';

export const IFindCustomerByIdUseCase = Symbol('IFindCustomerByIdUseCase');

export interface FindCustomerByIdCommand {
  customerId: string;
}

export interface FindCustomerByIdUseCase {
  execute(
    command: FindCustomerByIdCommand,
  ): Promise<
    Result<CustomerProps, UnauthorizedError | CustomerNotFoundError | InfrastructureError>
  >;
}
