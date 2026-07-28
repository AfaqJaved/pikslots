import {
  ClassGroup,
  ClassGroupAlreadyExistsInBusinessError,
  ClassGroupNotFoundError,
  ClassGroupRepository,
  err,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import { CLASS_GROUP_TEST_DATA } from './class.group.test.data';

export class ClassGroupRepositoryTestImpl implements ClassGroupRepository {
  private readonly data: ClassGroup[];

  constructor(data: ClassGroup[] = CLASS_GROUP_TEST_DATA) {
    this.data = [...data];
  }

  async save(
    group: ClassGroup,
  ): Promise<
    Result<void, ClassGroupAlreadyExistsInBusinessError | InfrastructureError>
  > {
    await Promise.resolve('');
    const collision = this.data.find(
      (g) =>
        g.name === group.name &&
        g.businessId === group.businessId &&
        !g.isDeleted,
    );

    if (collision) {
      return err({
        kind: 'class_group_already_exists',
        name: group.name,
        businessId: group.businessId,
        message: `A class group named '${group.name}' already exists for this business`,
        timestamp: new Date(),
      });
    }

    this.data.push(group);
    return ok(undefined);
  }

  async findById(
    id: string,
  ): Promise<
    Result<ClassGroup | null, ClassGroupNotFoundError | InfrastructureError>
  > {
    await Promise.resolve('');
    const found = this.data.find((g) => g.id === id && !g.isDeleted);

    return ok(found ?? null);
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<ClassGroup[], InfrastructureError>> {
    await Promise.resolve('');
    return ok(
      this.data.filter((g) => g.businessId === businessId && !g.isDeleted),
    );
  }

  async update(
    group: ClassGroup,
  ): Promise<Result<void, ClassGroupNotFoundError | InfrastructureError>> {
    await Promise.resolve('');
    const index = this.data.findIndex((g) => g.id === group.id && !g.isDeleted);

    if (index === -1) {
      return err({
        kind: 'class_group_not_found',
        by: 'id',
        value: group.id,
        message: `Class group not found against ${group.id}`,
        timestamp: new Date(),
      });
    }

    this.data[index] = group;
    return ok(undefined);
  }

  async delete(
    id: string,
  ): Promise<Result<void, ClassGroupNotFoundError | InfrastructureError>> {
    await Promise.resolve('');
    const index = this.data.findIndex((g) => g.id === id);

    if (index === -1) {
      return err({
        kind: 'class_group_not_found',
        by: 'id',
        value: id,
        message: `Class group not found against ${id}`,
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
