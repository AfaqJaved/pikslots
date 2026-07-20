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
  //   async save(
  //     businessEntity: Business,
  //   ): Promise<Result<void, InfrastructureError>> {
  //     try {
  //       await Promise.resolve('');

  //       BUSINESS_TEST_DATA.push(businessEntity);
  //       return ok(undefined);
  //     } catch (cause) {
  //       return err<InfrastructureError>({
  //         kind: 'infrastructure',
  //         message: 'Failed to save break',
  //         timestamp: new Date(),
  //         cause,
  //       });
  //     }
  //   }

  //   async findById(
  //     id: string,
  //   ): Promise<Result<Break | null, InfrastructureError>> {
  //     await Promise.resolve('');
  //     const breakFound = BUSINESS_TEST_DATA.filter((item) => item.id === id)[0];

  //     if (!breakFound) return ok(null);

  //     return ok(breakFound);
  //   }

  //   async findAllByUser(
  //     userId: string,
  //   ): Promise<Result<Break[], InfrastructureError>> {
  //     await Promise.resolve('');
  //     const breaksFound = BUSINESS_TEST_DATA.filter(
  //       (item) => item.userId === userId,
  //     );

  //     return ok(breaksFound);
  //   }

  //   async findAllByBusiness(
  //     businessId: string,
  //   ): Promise<Result<Break[], InfrastructureError>> {
  //     await Promise.resolve('');
  //     const BreaksFound = BUSINESS_TEST_DATA.filter(
  //       (item) => item.businessId === businessId,
  //     );
  //     return ok(BreaksFound);
  //   }

  //   async findAllByUserAndDay(
  //     userId: string,
  //     day: WeekDay,
  //   ): Promise<Result<Break[], InfrastructureError>> {
  //     await Promise.resolve('');
  //     const BreaksFound = BUSINESS_TEST_DATA.filter(
  //       (item) => item.userId === userId && item.day === day,
  //     );
  //     return ok(BreaksFound);
  //   }

  //   async update(
  //     breakEntity: Break,
  //   ): Promise<Result<void, BreakNotFoundError | InfrastructureError>> {
  //     await Promise.resolve('');
  //     const index = BUSINESS_TEST_DATA.findIndex(
  //       (item) => item.id === breakEntity.id,
  //     );
  //     if (index === -1) {
  //       return err<BreakNotFoundError>({
  //         kind: 'break_not_found',
  //         by: 'id',
  //         value: breakEntity.id,
  //         message: 'Break not found',
  //         timestamp: new Date(),
  //       });
  //     }
  //     BUSINESS_TEST_DATA[index] = breakEntity;
  //     return ok(undefined);
  //   }

  //   async delete(
  //     id: string,
  //   ): Promise<Result<void, BreakNotFoundError | InfrastructureError>> {
  //     await Promise.resolve('');
  //     const index = BUSINESS_TEST_DATA.findIndex((item) => item.id === id);
  //     if (index === -1) {
  //       return err<BreakNotFoundError>({
  //         kind: 'break_not_found',
  //         by: 'id',
  //         value: id,
  //         message: 'Break not found',
  //         timestamp: new Date(),
  //       });
  //     }
  //     BUSINESS_TEST_DATA.splice(index, 1);
  //     return ok(undefined);
  //   }

  //   async hasConflict(
  //     userId: string,
  //     day: WeekDay,
  //     startTime: string,
  //     endTime: string,
  //     excludeBreakId?: string,
  //   ): Promise<Result<boolean, InfrastructureError>> {
  //     await Promise.resolve('');
  //     const hasConflict = BREAK_TEST_DATA.some((item) => {
  //       if (item.userId !== userId || item.day !== day) {
  //         return false;
  //       }
  //       if (excludeBreakId && item.id === excludeBreakId) {
  //         return false;
  //       }
  //       return !(item.endTime <= startTime || item.startTime >= endTime);
  //     });
  //     return ok(hasConflict);
  //   }

  async save(
    business: Business,
  ): Promise<Result<void, BusinessAlreadyExistsError | InfrastructureError>> {
    await Promise.resolve('');
    const existingBusiness = BUSINESS_TEST_DATA.find(
      (item) => item.id === business.id,
    );
    if (existingBusiness) {
      return err<BusinessAlreadyExistsError>({
        kind: 'business_already_exists',
        by: 'id',
        value: business.id,
        message: 'Business alread exists',
        timestamp: new Date(),
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
    await Promise.resolve('');
    const businessFound = BUSINESS_TEST_DATA.find((item) => item.id === id);
    if (!businessFound) {
      return err<BusinessNotFoundError>({
        kind: 'business_not_found',
        by: 'id',
        value: id,
        message: 'Business not found',
        timestamp: new Date(),
      });
    }
    return ok(businessFound);
  }

  async findAll(): Promise<Result<Business[], InfrastructureError>> {
    await Promise.resolve('');
    return ok(BUSINESS_TEST_DATA);
  }

  async findByOwnerId(
    ownerId: string,
  ): Promise<
    Result<Business | null, BusinessNotFoundError | InfrastructureError>
  > {
    await Promise.reject('');
    const businessFound = BUSINESS_TEST_DATA.find(
      (item) => item.ownerId === ownerId,
    );
    if (!businessFound) {
      return err<BusinessNotFoundError>({
        kind: 'business_not_found',
        by: 'ownerId',
        value: ownerId,
        message: 'Business not found',
        timestamp: new Date(),
      });
    }
    return ok(businessFound);
  }

  async existsBySlug(
    slug: string,
  ): Promise<Result<boolean, InfrastructureError>> {
    await Promise.resolve('');
    const exists = BUSINESS_TEST_DATA.some((item) => item.slug === slug);
    return ok(exists);
  }

  async findBySlug(
    slug: string,
  ): Promise<
    Result<Business | null, BusinessNotFoundError | InfrastructureError>
  > {
    await Promise.resolve('');
    const businessFound = BUSINESS_TEST_DATA.find((item) => item.slug === slug);
    if (!businessFound) {
      return err<BusinessNotFoundError>({
        kind: 'business_not_found',
        by: 'slug',
        value: slug,
        message: 'Business not found',
        timestamp: new Date(),
      });
    }
    return ok(businessFound);
  }

  async update(
    business: Business,
  ): Promise<
    Result<
      void,
      BusinessNotFoundError | BusinessAlreadyExistsError | InfrastructureError
    >
  > {
    await Promise.resolve('');
    const index = BUSINESS_TEST_DATA.findIndex(
      (item) => item.id === business.id,
    );
    if (index === -1) {
      return err<BusinessNotFoundError>({
        kind: 'business_not_found',
        by: 'id',
        value: business.id,
        message: 'Business not found',
        timestamp: new Date(),
      });
    }
    BUSINESS_TEST_DATA[index] = business;
    return ok(undefined);
  }
}
