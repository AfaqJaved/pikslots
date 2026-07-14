import {
  Customer,
  CustomerAlreadyExistsError,
  CustomerNotFoundError,
  CustomerRepository,
  err,
  FullName,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import { CUSTOMER_TEST_DATA } from './customer.test.data';

export class CustomerRepositoryTestImpl implements CustomerRepository {
  async findCustomerListByBusiness(
    businessId: string,
  ): Promise<
    Result<
      { id: string; fullName: FullName; profileImageUrl: string | null }[],
      InfrastructureError
    >
  > {
    try {
      await Promise.resolve('');

      const customerFound = CUSTOMER_TEST_DATA.filter(
        (item) => item.businessId === businessId && item.isDeleted === false,
      );
      return ok(
        customerFound.map((customer) => ({
          id: customer.id,
          fullName: {
            firstName: customer.name.firstName,
            lastName: customer.name.lastName,
          },
          profileImageUrl: customer.profileImageUrl,
        })),
      );
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find customers by business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async save(
    customer: Customer,
  ): Promise<Result<void, CustomerAlreadyExistsError | InfrastructureError>> {
    try {
      await Promise.resolve('');
      const customerFound = CUSTOMER_TEST_DATA.find(
        (item) => item.id === customer.id && item.isDeleted === false,
      );
      if (customerFound) {
        return err<CustomerAlreadyExistsError>({
          kind: 'customer_already_exists',
          message: `Customer with id ${customer.id} already exists`,
          timestamp: new Date(),
          email: customerFound.email ?? '',
          businessId: customerFound.businessId,
        });
      }
      CUSTOMER_TEST_DATA.push(customer);
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save customer',
        timestamp: new Date(),
        cause,
      });
    }
  }
  async findById(
    id: string,
  ): Promise<
    Result<Customer | null, CustomerNotFoundError | InfrastructureError>
  > {
    try {
      await Promise.resolve();

      const customer = CUSTOMER_TEST_DATA.find(
        (customer) => customer.id === id && customer.isDeleted === false,
      );

      return ok(customer ?? null);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find customer by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<Customer[], InfrastructureError>> {
    try {
      await Promise.resolve();

      const customers = CUSTOMER_TEST_DATA.filter(
        (customer) =>
          customer.businessId === businessId && customer.isDeleted === false,
      );

      return ok(customers);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find customers by business',
        timestamp: new Date(),
        cause,
      });
    }
  }
  async update(
    customer: Customer,
  ): Promise<Result<void, CustomerNotFoundError | InfrastructureError>> {
    try {
      await Promise.resolve();

      const index = CUSTOMER_TEST_DATA.findIndex(
        (item) => item.id === customer.id && item.isDeleted === false,
      );

      if (index === -1) {
        return err<CustomerNotFoundError>({
          kind: 'customer_not_found',
          by: 'id',
          value: customer.id,
          message: `Customer not found against ${customer.id}`,
          timestamp: new Date(),
        });
      }

      CUSTOMER_TEST_DATA[index] = customer;

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to update customer',
        timestamp: new Date(),
        cause,
      });
    }
  }
  async delete(
    id: string,
  ): Promise<Result<void, CustomerNotFoundError | InfrastructureError>> {
    try {
      await Promise.resolve();

      const index = CUSTOMER_TEST_DATA.findIndex(
        (customer) => customer.id === id,
      );

      if (index === -1) {
        return err<CustomerNotFoundError>({
          kind: 'customer_not_found',
          by: 'id',
          value: id,
          message: `Customer not found against ${id}`,
          timestamp: new Date(),
        });
      }

      CUSTOMER_TEST_DATA.splice(index, 1);

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to delete customer',
        timestamp: new Date(),
        cause,
      });
    }
  }
  async existsByEmail(
    email: string,
    businessId: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    try {
      await Promise.resolve();

      const exists = CUSTOMER_TEST_DATA.some(
        (customer) =>
          customer.email === email &&
          customer.businessId === businessId &&
          customer.isDeleted === false,
      );

      return ok(exists);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to check customer existence by email',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
