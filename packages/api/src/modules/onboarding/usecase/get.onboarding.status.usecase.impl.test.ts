import { Test, TestingModule } from '@nestjs/testing';
import { err, IUserRepository, InfrastructureError } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../../user/repository/user.repository.fake.impl';
import { USER_TEST_DATA } from '../../user/repository/user.test.data';
import { GetOnboardingStatusUseCaseImpl } from './get.onboarding.status.usecase.impl';

describe('GetOnboardingStatusUseCaseImpl', () => {
  let useCase: GetOnboardingStatusUseCaseImpl;
  let userRepository: UserRepositoryTestImpl;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        GetOnboardingStatusUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
      ],
    }).compile();

    useCase = moduleRef.get(GetOnboardingStatusUseCaseImpl);
    userRepository = moduleRef.get(IUserRepository);
  });

  it('returns isOnboardingComplete true when a Platform Owner exists', async () => {
    const result = await useCase.execute();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ isOnboardingComplete: true });
    }
  });

  it('returns isOnboardingComplete false when no Platform Owner exists', async () => {
    const platformOwners = USER_TEST_DATA.filter(
      (user) => user.role !== 'Platform Owner',
    );
    USER_TEST_DATA.length = 0;
    USER_TEST_DATA.push(...platformOwners);

    const result = await useCase.execute();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ isOnboardingComplete: false });
    }
  });

  it('propagates an InfrastructureError from findAllByRole', async () => {
    const infraError: InfrastructureError = {
      kind: 'infrastructure',
      message: 'DB unreachable',
      timestamp: new Date(),
      cause: new Error('boom'),
    };
    jest
      .spyOn(userRepository, 'findAllByRole')
      .mockResolvedValueOnce(err(infraError));

    const result = await useCase.execute();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual(infraError);
    }
  });
});
