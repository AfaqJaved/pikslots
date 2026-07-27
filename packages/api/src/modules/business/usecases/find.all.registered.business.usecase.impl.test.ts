import { Test, TestingModule } from '@nestjs/testing';
import {
  Business,
  err,
  IBusinessRepository,
  InfrastructureError,
} from '@pikslots/domain';
import { BUSINESS_TEST_DATA } from '../repository/business.fake.data';
import { FindAllRegisteredBusinessesUseCaseImpl } from './find.all.registered.businesses.usecase.impl';
import { BusinessRepositoryTestImpl } from '../repository/business.repository.fake.impl';

describe('FindAllRegisteredBusinessesUseCaseImpl', () => {
  let useCase: FindAllRegisteredBusinessesUseCaseImpl;
  let repository: BusinessRepositoryTestImpl;
  let originalData: Business[];

  beforeEach(async () => {
    if (!originalData) originalData = [...BUSINESS_TEST_DATA];
    BUSINESS_TEST_DATA.length = 0;
    BUSINESS_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllRegisteredBusinessesUseCaseImpl,
        {
          provide: IBusinessRepository,
          useClass: BusinessRepositoryTestImpl,
        },
      ],
    }).compile();

    useCase = moduleRef.get(FindAllRegisteredBusinessesUseCaseImpl);
    repository = moduleRef.get(IBusinessRepository);
  });

  // NOTE: like FindAllClassesByBusinessUseCaseImpl and
  // FindAllServicesByBusinessUseCaseImpl, this use case has no
  // SecurityContext dependency and performs no authorization check at all
  // -- any caller can list every registered business. Given this returns
  // data across all businesses (not scoped to one), that's worth confirming
  // is intentional (e.g. a platform-owner-only admin screen guarded
  // elsewhere, like a controller-level role guard) rather than an
  // oversight.

  describe('successful lookup', () => {
    it('returns all non-deleted businesses', async () => {
      const result = await useCase.execute();

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((b) => b.id);
        expect(ids).toContain('business-1');
        expect(ids).toContain('business-2');
        expect(ids).toContain('business-3');
        expect(ids).toContain('business-trial-expired-1');
        expect(ids).toContain('business-new-1');
      }
    });

    it('excludes soft-deleted businesses', async () => {
      const result = await useCase.execute();

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((b) => b.id);
        expect(ids).not.toContain('business-deleted-1');
      }
    });

    it('returns full Business entities, not a projection', async () => {
      const result = await useCase.execute();

      expect(result.ok).toBe(true);
      if (result.ok) {
        const business1 = result.value.find((b) => b.id === 'business-1');
        expect(business1).toBeInstanceOf(Business);
        expect(business1?.name).toBe("Alice's Salon & Spa");
        expect(business1?.slug).toBe('alices-salon-and-spa');
        expect(business1?.status).toBe('active');
      }
    });

    it('returns an empty array when there are no businesses', async () => {
      BUSINESS_TEST_DATA.length = 0;

      const result = await useCase.execute();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from findAll', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'DB unreachable',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest.spyOn(repository, 'findAll').mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });
  });
});
