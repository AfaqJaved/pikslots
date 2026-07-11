import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { FindUserByIdUseCaseImpl } from './find.user.by.id.usecase.impl';

describe('FindUserByIdUseCaseImpl', () => {
  let useCase: FindUserByIdUseCaseImpl;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserByIdUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
      ],
    }).compile();

    useCase = moduleRef.get(FindUserByIdUseCaseImpl);
  });

  it('returns the user when a valid id is provided', async () => {
    const result = await useCase.execute('user-platform-owner-1');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe('user-platform-owner-1');
      expect(result.value.role).toBe('Platform Owner');
    }
  });

  it('returns the user for each role', async () => {
    const cases: { id: string; role: string }[] = [
      { id: 'user-platform-owner-1', role: 'Platform Owner' },
      { id: 'user-business-owner-1', role: 'Business Owner' },
      { id: 'user-admin-1', role: 'Admin' },
      { id: 'user-enhanced-1', role: 'Enhanced' },
      { id: 'user-standard-1', role: 'Standard' },
      { id: 'user-no-access-1', role: 'No Access' },
    ];

    for (const { id, role } of cases) {
      const result = await useCase.execute(id);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(id);
        expect(result.value.role).toBe(role);
      }
    }
  });

  it('returns user_not_found error when id does not exist', async () => {
    const result = await useCase.execute('non-existent-id');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('user_not_found');
  });
});
