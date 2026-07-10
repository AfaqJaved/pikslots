import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { GetAllUsersByRoleUseCaseImpl } from './get.all.users.by.role.usecase.impl';

describe('GetAllUsersByRoleUseCaseImpl', () => {
  let useCase: GetAllUsersByRoleUseCaseImpl;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllUsersByRoleUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
      ],
    }).compile();

    useCase = moduleRef.get(GetAllUsersByRoleUseCaseImpl);
  });

  it('returns users when caller can query the role', async () => {
    const result = await useCase.execute('Platform Owner', 'Admin');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBeGreaterThanOrEqual(1);
      expect(result.value[0].role).toBe('Admin');
    }
  });

  it('returns role_query_not_authorized when caller cannot query role', async () => {
    const result = await useCase.execute('Standard', 'Admin');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('role_query_not_authorized');
      expect(result.error.message).toBeDefined();
      expect((result.error as any).callerRole).toBe('Standard');
      expect((result.error as any).queriedRole).toBe('Admin');
    }
  });
});
