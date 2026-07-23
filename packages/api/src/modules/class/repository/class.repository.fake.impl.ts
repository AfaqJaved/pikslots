import {
  Class,
  ClassNotFoundError,
  ClassRepository,
  err,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import { CLASS_TEST_DATA } from './class.test.data';

export class ClassRepositoryTestImpl implements ClassRepository {
  async save(cls: Class): Promise<Result<void, InfrastructureError>> {
    try {
      await Promise.resolve();

      CLASS_TEST_DATA.push(cls);
      return ok(undefined);
    } catch (cause) {
      return err<InfrastructureError>({
        kind: 'infrastructure',
        message: 'Failed to save class',
        timestamp: new Date(),
        cause,
      });
    }
  }

  async findById(
    id: string,
  ): Promise<Result<Class | null, ClassNotFoundError | InfrastructureError>> {
    await Promise.resolve();

    const cls = CLASS_TEST_DATA.find(
      (item) => item.id === id && item.isDeleted === false,
    );

    return ok(cls ?? null);
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<Result<Class[], InfrastructureError>> {
    await Promise.resolve();

    const classes = CLASS_TEST_DATA.filter(
      (item) => item.businessId === businessId && item.isDeleted === false,
    );

    return ok(classes);
  }

  async update(
    cls: Class,
  ): Promise<Result<void, ClassNotFoundError | InfrastructureError>> {
    await Promise.resolve();

    const index = CLASS_TEST_DATA.findIndex(
      (item) => item.id === cls.id && item.isDeleted === false,
    );

    if (index === -1) {
      return err<ClassNotFoundError>({
        kind: 'class_not_found',
        by: 'id',
        value: cls.id,
        message: `Class not found against ${cls.id}`,
        timestamp: new Date(),
      });
    }

    CLASS_TEST_DATA[index] = cls;

    return ok(undefined);
  }

  async delete(
    id: string,
  ): Promise<Result<void, ClassNotFoundError | InfrastructureError>> {
    await Promise.resolve();

    const index = CLASS_TEST_DATA.findIndex((item) => item.id === id);

    if (index === -1) {
      return err<ClassNotFoundError>({
        kind: 'class_not_found',
        by: 'id',
        value: id,
        message: `Class not found against ${id}`,
        timestamp: new Date(),
      });
    }

    CLASS_TEST_DATA.splice(index, 1);

    return ok(undefined);
  }

  async existsByTitle(
    title: string,
    businessId: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    await Promise.resolve();

    const exists = CLASS_TEST_DATA.some(
      (item) =>
        item.title === title &&
        item.businessId === businessId &&
        item.isDeleted === false,
    );

    return ok(exists);
  }
}
