import { Test, TestingModule } from '@nestjs/testing';
import {
  Class,
  err,
  IClassRepository,
  InfrastructureError,
} from '@pikslots/domain';
import { CLASS_TEST_DATA } from '../repository/class.test.data';
import { ClassRepositoryTestImpl } from '../repository/class.repository.fake.impl';
import { FindAllClassesByBusinessUseCaseImpl } from './find.all.classes.by.business.usecase.impl';

describe('FindAllClassesByBusinessUseCaseImpl', () => {
  let useCase: FindAllClassesByBusinessUseCaseImpl;
  let repository: ClassRepositoryTestImpl;
  let originalData: Class[];

  beforeEach(async () => {
    if (!originalData) originalData = [...CLASS_TEST_DATA];
    CLASS_TEST_DATA.length = 0;
    CLASS_TEST_DATA.push(...originalData);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllClassesByBusinessUseCaseImpl,
        { provide: IClassRepository, useClass: ClassRepositoryTestImpl },
      ],
    }).compile();

    useCase = moduleRef.get(FindAllClassesByBusinessUseCaseImpl);
    repository = moduleRef.get(IClassRepository);
  });

  // NOTE: this use case has no SecurityContext dependency and performs no
  // authorization check of its own -- it's a direct pass-through to
  // classRepository.findAllByBusiness(businessId). Flagging this in case
  // it's meant to stay publicly accessible (e.g. a booking page listing)
  // rather than an oversight relative to the Customer equivalent, which
  // does check Customer.canViewCustomer.

  describe('successful lookup', () => {
    it('returns all non-deleted classes for the given business', async () => {
      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((c) => c.id);
        expect(ids).toContain('class-yoga-1');
        expect(ids).toContain('class-pilates-1');
        expect(ids).toContain('class-hiit-1');
        expect(ids).not.toContain('class-business-2-1');
      }
    });

    it('excludes soft-deleted classes', async () => {
      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.map((c) => c.id);
        expect(ids).not.toContain('class-deleted-1');
      }
    });

    it('returns an empty array for a business with no classes', async () => {
      const result = await useCase.execute('business-does-not-exist');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it('returns full Class entities, not a projection', async () => {
      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const yoga = result.value.find((c) => c.id === 'class-yoga-1');
        expect(yoga).toBeInstanceOf(Class);
        expect(yoga?.title).toBe('Morning Yoga Flow');
        expect(yoga?.seats).toBe(15);
        expect(yoga?.cost).toBe(20);
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
