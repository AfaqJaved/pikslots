import { Test, TestingModule } from '@nestjs/testing';
import {
  err,
  IServiceGroupRepository,
  InfrastructureError,
} from '@pikslots/domain';

import { ServiceGroupRepositoryTestImpl } from '../repository/service.group.repository.fake.impl';
import { SERVICE_GROUP_TEST_DATA } from '../repository/service.group.test.data';
import { FindAllServiceGroupsByBusinessUseCaseImpl } from './find.all.service.groups.by.business.usecase.impl';

describe('FindAllServiceGroupsByBusinessUseCaseImpl', () => {
  let useCase: FindAllServiceGroupsByBusinessUseCaseImpl;
  let repository: ServiceGroupRepositoryTestImpl;
  let originalData: typeof SERVICE_GROUP_TEST_DATA;

  beforeEach(async () => {
    if (!originalData) originalData = [...SERVICE_GROUP_TEST_DATA];

    SERVICE_GROUP_TEST_DATA.length = 0;
    SERVICE_GROUP_TEST_DATA.push(...originalData);

    repository = new ServiceGroupRepositoryTestImpl(SERVICE_GROUP_TEST_DATA);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllServiceGroupsByBusinessUseCaseImpl,
        {
          provide: IServiceGroupRepository,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get(FindAllServiceGroupsByBusinessUseCaseImpl);
  });

  describe('successful execution', () => {
    it('returns every service group belonging to the requested business', async () => {
      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value).toHaveLength(2); // adjust to your fixture
        expect(
          result.value.every((group) => group.businessId === 'business-1'),
        ).toBe(true);
      }
    });

    it('returns an empty array when the business has no service groups', async () => {
      const result = await useCase.execute('business-does-not-exist');

      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });
  });

  describe('repository interactions', () => {
    it('calls findAllByBusiness with the supplied businessId', async () => {
      const spy = jest.spyOn(repository, 'findAllByBusiness');

      await useCase.execute('business-123');

      expect(spy).toHaveBeenCalledWith('business-123');
    });
  });

  describe('repository failures', () => {
    it('propagates InfrastructureError from findAllByBusiness', async () => {
      const infraError: InfrastructureError = {
        kind: 'infrastructure',
        message: 'Database failure',
        timestamp: new Date(),
        cause: new Error('boom'),
      };

      jest
        .spyOn(repository, 'findAllByBusiness')
        .mockResolvedValueOnce(err(infraError));

      const result = await useCase.execute('business-1');

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBe(infraError);
      }
    });
  });
});
