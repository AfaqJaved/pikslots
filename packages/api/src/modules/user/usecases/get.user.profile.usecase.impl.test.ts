import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { GetUserProfileUseCaseImpl } from './get.user.profile.usecase.impl';

describe('GetUserProfileUseCaseImpl', () => {
  let useCase: GetUserProfileUseCaseImpl;
  let repo: any;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserProfileUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
      ],
    }).compile();

    useCase = moduleRef.get(GetUserProfileUseCaseImpl);
    repo = moduleRef.get(IUserRepository);
  });

  it('returns user when active', async () => {
    const find = await repo.findById('user-standard-1');
    const accepted = find.value.acceptInvite('pw', 'test');
    await repo.update(accepted);

    const result = await useCase.execute('user-standard-1');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.id).toBe('user-standard-1');
  });

  it('returns user_not_found for missing user', async () => {
    const result = await useCase.execute('non-existent');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('user_not_found');
      expect(result.error.message).toBeDefined();
      expect((result.error as any).by).toBe('id');
      expect((result.error as any).value).toBe('non-existent');
    }
  });

  it('returns user_inactive for invited users', async () => {
    const result = await useCase.execute('user-business-owner-1');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('user_inactive');
      expect(result.error.message).toBeDefined();
    }
  });
});
