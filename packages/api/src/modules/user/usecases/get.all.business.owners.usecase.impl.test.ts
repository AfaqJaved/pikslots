import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { GetAllBusinessOwnersUseCaseImpl } from './get.all.business.owners.usecase.impl';

describe('GetAllBusinessOwnersUseCaseImpl', () => {
  let useCase: GetAllBusinessOwnersUseCaseImpl;

  it('returns business owners', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllBusinessOwnersUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
      ],
    }).compile();

    useCase = moduleRef.get(GetAllBusinessOwnersUseCaseImpl);
    const result = await useCase.execute();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBeGreaterThanOrEqual(1);
      expect(result.value.every((u) => u.role === 'Business Owner')).toBe(true);
    }
  });
});
