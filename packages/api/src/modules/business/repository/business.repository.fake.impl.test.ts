import {
  Business,
  BusinessAlreadyExistsError,
  BusinessNotFoundError,
  BusinessRepository,
  err,
  InfrastructureError,
  ok,
  Result,
} from '@pikslots/domain';
import { BUSINESS_TEST_DATA } from './business.fake.data';

export class BusinessRepositoryTestImpl implements BusinessRepository {
  async save(
    business: Business,
  ): Promise<Result<void, BusinessAlreadyExistsError | InfrastructureError>> {
    await Promise.resolve();

    // Mirrors the real repo's unique constraint on slug, not id (ids come
    // from uuidv7() and never collide in practice).
    const slugConflict = BUSINESS_TEST_DATA.some(
      (item) => item.slug === business.slug && item.isDeleted === false,
    );
    if (slugConflict) {
      return err<BusinessAlreadyExistsError>({
        kind: 'business_already_exists',
        message: `A business with this slug already exists`,
        timestamp: new Date(),
        field: 'slug',
      });
    }

    BUSINESS_TEST_DATA.push(business);
    return ok(undefined);
  }

  async findById(
    id: string,
  ): Promise<
    Result<Business | null, BusinessNotFoundError | InfrastructureError>
  > {
    await Promise.resolve();

    const found = BUSINESS_TEST_DATA.find(
      (item) => item.id === id && item.isDeleted === false,
    );

    return ok(found ?? null);
  }

  async findBySlug(
    slug: string,
  ): Promise<
    Result<Business | null, BusinessNotFoundError | InfrastructureError>
  > {
    await Promise.resolve();

    const found = BUSINESS_TEST_DATA.find(
      (item) => item.slug === slug && item.isDeleted === false,
    );

    return ok(found ?? null);
  }

  async findByOwnerId(
    ownerId: string,
  ): Promise<
    Result<Business | null, BusinessNotFoundError | InfrastructureError>
  > {
    await Promise.resolve();

    const found = BUSINESS_TEST_DATA.find(
      (item) => item.ownerId === ownerId && item.isDeleted === false,
    );

    return ok(found ?? null);
  }

  async update(
    business: Business,
  ): Promise<
    Result<
      void,
      BusinessNotFoundError | BusinessAlreadyExistsError | InfrastructureError
    >
  > {
    await Promise.resolve();

    const index = BUSINESS_TEST_DATA.findIndex(
      (item) => item.id === business.id && item.isDeleted === false,
    );

    if (index === -1) {
      return err<BusinessNotFoundError>({
        kind: 'business_not_found',
        by: 'id',
        value: business.id,
        message: `Business not found: ${business.id}`,
        timestamp: new Date(),
      });
    }

    // Same slug-uniqueness rule as save(), excluding the business being
    // updated itself.
    const slugConflict = BUSINESS_TEST_DATA.some(
      (item) =>
        item.id !== business.id &&
        item.slug === business.slug &&
        item.isDeleted === false,
    );
    if (slugConflict) {
      return err<BusinessAlreadyExistsError>({
        kind: 'business_already_exists',
        message: `A business with this slug already exists`,
        timestamp: new Date(),
        field: 'slug',
      });
    }

    BUSINESS_TEST_DATA[index] = business;
    return ok(undefined);
  }

  async existsBySlug(
    slug: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    await Promise.resolve();

    const exists = BUSINESS_TEST_DATA.some(
      (item) => item.slug === slug && item.isDeleted === false,
    );

    return ok(exists);
  }

  async findAll(): Promise<Result<Business[], InfrastructureError>> {
    await Promise.resolve();

    const businesses = BUSINESS_TEST_DATA.filter(
      (item) => item.isDeleted === false,
    );

    return ok(businesses);
  }
}
