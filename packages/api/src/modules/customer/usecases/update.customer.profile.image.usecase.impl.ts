import { Inject } from '@nestjs/common';
import {
  Customer,
  CustomerNotFoundError,
  err,
  ICustomerRepository,
  InfrastructureError,
  ok,
  type CustomerRepository,
  type Result,
  type UnauthorizedError,
  type UpdateCustomerProfileImageCommand,
  type UpdateCustomerProfileImageUseCase,
} from '@pikslots/domain';
import {
  IPikslotS3Service,
  type PikslotS3Service,
} from 'src/shared/s3/s3.service';
import { SecurityContext } from 'src/shared/security/context/security.context';

export class UpdateCustomerProfileImageUseCaseImpl implements UpdateCustomerProfileImageUseCase {
  constructor(
    @Inject(ICustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @Inject(IPikslotS3Service)
    private readonly s3Service: PikslotS3Service,
    private readonly securityContext: SecurityContext,
  ) {}

  async execute(
    command: UpdateCustomerProfileImageCommand,
  ): Promise<
    Result<
      Customer,
      CustomerNotFoundError | UnauthorizedError | InfrastructureError
    >
  > {
    const customerFound = await this.customerRepository.findById(
      command.customerId,
    );
    if (!customerFound.ok)
      return err(customerFound.error as InfrastructureError);

    const target = customerFound.value;

    if (!target) {
      return err<CustomerNotFoundError>({
        kind: 'customer_not_found',
        message: `Customer not found with id =${command.customerId}`,
        by: 'id',
        timestamp: new Date(),
        value: command.customerId,
      });
    }

    const callerRole = this.securityContext.role;
    const isPartOfSameBusiness =
      target.businessId === this.securityContext.businessId;

    if (!Customer.canUpdateProfileImage(callerRole, isPartOfSameBusiness)) {
      return err<UnauthorizedError>({
        kind: 'unauthorized',
        message: `Can not perform the operation Role ${this.securityContext.role}`,
        timestamp: new Date(),
      });
    }

    const updated = target.updateProfileImageUrl(command.profileImageKey);

    const updateResult = await this.customerRepository.update(updated);
    if (!updateResult.ok) return err(updateResult.error);

    if (target.profileImageUrl !== null) {
      await this.s3Service.deleteFile(target.profileImageUrl);
    }

    return ok(updated);
  }
}
