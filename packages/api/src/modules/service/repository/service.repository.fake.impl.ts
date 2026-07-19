import {
  err,
  InfrastructureError,
  ok,
  Result,
  Service,
  ServiceNotFoundError,
  ServiceRepository,
} from '@pikslots/domain';
import { SERVICE_TEST_DATA } from './service.test.data';

export class ServiceRepositoryTestImpl implements ServiceRepository {
  async save(service: Service): Promise<Result<void, InfrastructureError>> {
    try {
      await Promise.resolve();

      SERVICE_TEST_DATA.push(service);
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save service',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<
    Result<Service | null, ServiceNotFoundError | InfrastructureError>
  > {
    try {
      await Promise.resolve();

      const service = SERVICE_TEST_DATA.find(
        (item) => item.id === id && item.isDeleted === false,
      );

      return ok(service ?? null);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find service by id',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<Service[], InfrastructureError>> {
    try {
      await Promise.resolve();

      const services = SERVICE_TEST_DATA.filter(
        (item) => item.businessId === businessId && item.isDeleted === false,
      );

      return ok(services);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to find services by business',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async update(
    service: Service,
  ): Promise<Result<void, ServiceNotFoundError | InfrastructureError>> {
    try {
      await Promise.resolve();

      const index = SERVICE_TEST_DATA.findIndex(
        (item) => item.id === service.id && item.isDeleted === false,
      );

      if (index === -1) {
        return err<ServiceNotFoundError>({
          kind: 'service_not_found',
          by: 'id',
          value: service.id,
          message: `Service not found against ${service.id}`,
          timestamp: new Date(),
        });
      }

      SERVICE_TEST_DATA[index] = service;

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to update service',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async delete(
    id: string,
  ): Promise<Result<void, ServiceNotFoundError | InfrastructureError>> {
    try {
      await Promise.resolve();

      const index = SERVICE_TEST_DATA.findIndex((item) => item.id === id);

      if (index === -1) {
        return err<ServiceNotFoundError>({
          kind: 'service_not_found',
          by: 'id',
          value: id,
          message: `Service not found against ${id}`,
          timestamp: new Date(),
        });
      }

      SERVICE_TEST_DATA.splice(index, 1);

      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to delete service',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async existsByTitle(
    title: string,
    businessId: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    try {
      await Promise.resolve();

      const exists = SERVICE_TEST_DATA.some(
        (item) =>
          item.title === title &&
          item.businessId === businessId &&
          item.isDeleted === false,
      );

      return ok(exists);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to check service existence by title',
        timestamp: new Date(),
        cause,
      });
    }
  }
}
