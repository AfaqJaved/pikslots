import { Test, TestingModule } from '@nestjs/testing';
import {
  err,
  IServiceRepository,
  InfrastructureError,
  Service,
} from '@pikslots/domain';
import { SERVICE_TEST_DATA } from '../repository/service.test.data';
import { ServiceRepositoryTestImpl } from '../repository/service.repository.fake.impl';
import { FindAllServicesByBusinessUseCaseImpl } from './find.all.services.by.business.usecase.impl';

describe('FindAllServicesByBusinessUseCaseImpl', () => {
  let useCase: FindAllServicesByBusinessUseCaseImpl;
  let repository: ServiceRepositoryTestImpl;
  let originalData: Service[];

  beforeEach(async () => {
    if (!originalData) originalData = [...SERVICE_TEST_DATA];
    SERVICE_TEST_DATA.length = 0;
    SERVICE_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllServicesByBusinessUseCaseImpl,
        { provide: IServiceRepository, useClass: ServiceRepositoryTestImpl },
      ],
    }).compile();

    useCase = moduleRef.get(FindAllServicesByBusinessUseCaseImpl);
    repository = moduleRef.get(IServiceRepository);
  });

  // NOTE: this use case has no SecurityContext dependency and performs no
  // authorization check of its own -- it's a direct pass-through to
  // serviceRepository.findAllByBusiness(businessId), same as
  // FindAllClassesByBusinessUseCaseImpl. Flagging in case it's meant to
  // stay publicly accessible (e.g. a booking page listing) rather than an
  // oversight.

  describe('successful lookup', () => {
    it('returns all non-deleted services for the given business', async () => {
      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((s) => s.id);
        expect(ids).toContain('service-haircut-1');
        expect(ids).toContain('service-massage-1');
        expect(ids).toContain('service-consultation-1');
        expect(ids).not.toContain('service-business-2-1');
      }
    });

    it('excludes soft-deleted services', async () => {
      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((s) => s.id);
        expect(ids).not.toContain('service-deleted-1');
      }
    });

    it('returns an empty array for a business with no services', async () => {
      const result = await useCase.execute('business-does-not-exist');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('returns full Service entities, not a projection', async () => {
      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const haircut = result.value.find((s) => s.id === 'service-haircut-1');
        expect(haircut).toBeInstanceOf(Service);
        expect(haircut?.title).toBe('Haircut & Style');
        expect(haircut?.bufferTimeInMins).toBe(15);
        expect(haircut?.cost).toBe(40);
      }
    });
  });

  describe('repository failures', () => {
    it('propagates an InfrastructureError from findAllByBusiness', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'DB unreachable',
        timestamp: new Date(),
        cause: new Error('boom'),
      };
      jest
        .spyOn(repository, 'findAllByBusiness')
        .mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(infraError);
      }
    });
  });
});
