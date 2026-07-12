import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository, UserRole } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { GetAllUsersByRoleUseCaseImpl } from './get.all.users.by.role.usecase.impl';

describe('GetAllUsersByRoleUseCaseImpl', () => {
  let useCase: GetAllUsersByRoleUseCaseImpl;

  const QUERY_PERMISSIONS: Record<UserRole, UserRole[]> = {
    'Platform Owner': [
      'Platform Owner',
      'Business Owner',
      'Admin',
      'Enhanced',
      'Standard',
      'No Access',
    ],
    'Business Owner': ['Admin', 'Enhanced', 'Standard', 'No Access'],
    Admin: ['Enhanced', 'Standard', 'No Access'],
    Enhanced: [],
    Standard: [],
    'No Access': [],
  };

  const ALL_ROLES: UserRole[] = [
    'Platform Owner',
    'Business Owner',
    'Admin',
    'Enhanced',
    'Standard',
    'No Access',
  ];

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllUsersByRoleUseCaseImpl,
        {
          provide: IUserRepository,
          useClass: UserRepositoryTestImpl,
        },
      ],
    }).compile();

    useCase = moduleRef.get(GetAllUsersByRoleUseCaseImpl);
  });

  describe('authorized role queries', () => {
    for (const callerRole of ALL_ROLES) {
      for (const targetRole of QUERY_PERMISSIONS[callerRole]) {
        it(`${callerRole} can query ${targetRole}`, async () => {
          const result = await useCase.execute(callerRole, targetRole);

          expect(result.ok).toBe(true);

          if (result.ok) {
            expect(result.value).toBeDefined();

            // Every returned user should have the queried role
            expect(result.value.every((user) => user.role === targetRole)).toBe(
              true,
            );
          }
        });
      }
    }
  });

  describe('unauthorized role queries', () => {
    for (const callerRole of ALL_ROLES) {
      const forbiddenRoles = ALL_ROLES.filter(
        (role) => !QUERY_PERMISSIONS[callerRole].includes(role),
      );

      for (const targetRole of forbiddenRoles) {
        it(`${callerRole} cannot query ${targetRole}`, async () => {
          const result = await useCase.execute(callerRole, targetRole);

          expect(result.ok).toBe(false);

          if (!result.ok) {
            expect(result.error.kind).toBe('role_query_not_authorized');
            expect(result.error.message).toBeDefined();
            expect(result.error.callerRole).toBe(callerRole);
            expect(result.error.queriedRole).toBe(targetRole);
          }
        });
      }
    }
  });
});
