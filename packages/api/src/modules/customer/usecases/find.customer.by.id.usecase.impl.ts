import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  Customer,
  CustomerNotFoundError,
  FindCustomerByIdCommand,
  FindCustomerByIdUseCase,
  type CustomerProps,
  type CustomerRepository,
  ICustomerRepository,
  InfrastructureError,
  Result,
  UnauthorizedError,
} from '@pikslots/domain';
import { SecurityContext } from 'src/shared/security/context/security.context';

const UNAUTHORIZED_ERROR: UnauthorizedError = {
  kind: 'unauthorized',
  message: 'Access Denied',
  timestamp: new Date(),
};

@Injectable()
export class FindCustomerByIdUseCaseImpl implements FindCustomerByIdUseCase {
  constructor(
    @Inject(ICustomerRepository)
    private readonly customerRepository: CustomerRepository,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: FindCustomerByIdCommand,
  ): Promise<
    Result<
      CustomerProps,
      UnauthorizedError | CustomerNotFoundError | InfrastructureError
    >
  > {
    const found = await this.customerRepository.findById(command.customerId);

    if (!found.ok) return err(found.error);

    if (!found.value) {
      return err({
        kind: 'customer_not_found',
        message: `Customer not found by id: ${command.customerId}`,
        timestamp: new Date(),
        by: 'id',
        value: command.customerId,
      } satisfies CustomerNotFoundError);
    }

    const callerRole = this.securityContext.role;
    const callerBusinessId = this.securityContext.businessId;
    const isPartOfSameBusiness = callerBusinessId === found.value.businessId;

    if (!Customer.canViewCustomer(callerRole, isPartOfSameBusiness))
      return err(UNAUTHORIZED_ERROR);

    return ok(found.value.toProps());
  }
}
