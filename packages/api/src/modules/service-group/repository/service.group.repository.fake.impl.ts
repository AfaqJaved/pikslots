import {
  ServiceGroup,
  ServiceGroupAlreadyExistsInBusinessError,
  ServiceGroupNotFoundError,
  ServiceGroupRepository,
  err,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import { SERVICE_GROUP_TEST_DATA } from './service.group.test.data';

export class ServiceGroupRepositoryTestImpl implements ServiceGroupRepository {
  private readonly data: ServiceGroup[];

  constructor(data: ServiceGroup[] = SERVICE_GROUP_TEST_DATA) {
    // Intentionally NOT spread-copied — must share identity with the caller's
    // array so mutations here are visible when tests inspect
    // SERVICE_GROUP_TEST_DATA directly after calling a use case. Spreading
    // here silently detaches this repo from that array (bit us on the
    // class-group module).
    this.data = data;
  }

  async save(
    group: ServiceGroup,
  ): Promise<
    Result<void, ServiceGroupAlreadyExistsInBusinessError | InfrastructureError>
  > {
    await Promise.resolve('');
    const collision = this.data.find(
      (g) =>
        g.name === group.name &&
        g.businessId === group.businessId &&
        !g.isDeleted,
    );

    if (collision) {
      return err<ServiceGroupAlreadyExistsInBusinessError>({
        kind: 'service_group_already_exists',
        name: group.name,
        businessId: group.businessId,
        message: `A service group named '${group.name}' already exists for this business`,
        timestamp: new Date(),
      });
    }

    this.data.push(group);
    return ok(undefined);
  }

  async findById(
    id: string,
  ): Promise<
    Result<ServiceGroup | null, ServiceGroupNotFoundError | InfrastructureError>
  > {
    // Real impl filters is_deleted = false and returns ok(null) on a miss —
    // ServiceGroupNotFoundError is declared in the interface but never
    // actually produced here. Mirrored as-is, not "fixed".
    await Promise.resolve('');
    const found = this.data.find((g) => g.id === id && !g.isDeleted);
    return ok(found ?? null);
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<ServiceGroup[], InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      this.data.filter((g) => g.businessId === businessId && !g.isDeleted),
    );
  }

  async update(
    group: ServiceGroup,
  ): Promise<Result<void, ServiceGroupNotFoundError | InfrastructureError>> {
    // Real query is scoped to is_deleted = false — updating a deleted (or
    // nonexistent) group's id returns not-found, matching that.
    await Promise.resolve('');
    const index = this.data.findIndex((g) => g.id === group.id && !g.isDeleted);

    if (index === -1) {
      return err<ServiceGroupNotFoundError>({
        kind: 'service_group_not_found',
        by: 'id',
        value: group.id,
        message: `Service group not found against ${group.id}`,
        timestamp: new Date(),
      });
    }

    this.data[index] = group;
    return ok(undefined);
  }

  async delete(
    id: string,
  ): Promise<Result<void, ServiceGroupNotFoundError | InfrastructureError>> {
    // Real query has NO is_deleted filter — it will hard-delete an already
    // soft-deleted row too. Only a truly nonexistent id is "not found".
    await Promise.resolve('');
    const index = this.data.findIndex((g) => g.id === id);

    if (index === -1) {
      return err<ServiceGroupNotFoundError>({
        kind: 'service_group_not_found',
        by: 'id',
        value: id,
        message: `Service group not found against ${id}`,
        timestamp: new Date(),
      });
    }

    this.data.splice(index, 1);
    return ok(undefined);
  }

  async existsByName(
    name: string,
    businessId: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    await Promise.resolve('');
    const exists = this.data.some(
      (g) => g.name === name && g.businessId === businessId && !g.isDeleted,
    );
    return ok(exists);
  }
}
