import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { FindAllUsersInsideBusinessUseCaseImpl } from './find.all.users.inside.business.usecase.impl';
import { SecurityContext } from 'src/shared/security/context/security.context';

describe('FindAllUsersInsideBusinessUseCaseImpl', () => {
  let useCase: FindAllUsersInsideBusinessUseCaseImpl;



  it('returns unauthorized for No Access role', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllUsersInsideBusinessUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
        {
          provide: SecurityContext,
          useValue: {
            role: 'No Access',
            userId: 'user-no-access-1',
            businessId: 'business-1',
          },
        },
      ],
    }).compile();

    const local = moduleRef.get(FindAllUsersInsideBusinessUseCaseImpl);
    const result = await local.execute('business-1');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('unauthorized');
    }
  });

  it('returns only self for Standard role', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllUsersInsideBusinessUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
        {
          provide: SecurityContext,
          useValue: {
            role: 'Standard',
            userId: 'user-standard-1',
            businessId: 'business-1',
          },
        },
      ],
    }).compile();

    const local = moduleRef.get(FindAllUsersInsideBusinessUseCaseImpl);
    const result = await local.execute('business-1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBe(1);
      expect(result.value[0].id).toBe('user-standard-1');
    }
  });

  it('returns all users for Admin role', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllUsersInsideBusinessUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
        {
          provide: SecurityContext,
          useValue: {
            role: 'Admin',
            userId: 'user-admin-1',
            businessId: 'business-1',
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get(FindAllUsersInsideBusinessUseCaseImpl);

    
    const result = await useCase.execute('business-1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBeGreaterThanOrEqual(1);
    }
  });
});
