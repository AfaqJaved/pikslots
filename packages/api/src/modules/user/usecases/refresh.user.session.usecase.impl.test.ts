import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository, ok, err, UnauthorizedError } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { RefreshUserSessionUseCaseImpl } from './refresh.user.session.usecase.impl';
import { JwtLoginService } from 'src/shared/security/jwt/jwt.login.service';

describe('RefreshUserSessionUseCaseImpl', () => {
  let useCase: RefreshUserSessionUseCaseImpl;
  let jwt: jest.Mocked<JwtLoginService>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshUserSessionUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
        {
          provide: JwtLoginService,
          useValue: {
            verifyRefreshToken: jest.fn(),
            signAccessToken: jest.fn().mockReturnValue('a'),
            signRefreshToken: jest.fn().mockReturnValue('r'),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get(RefreshUserSessionUseCaseImpl);
    jwt = moduleRef.get(JwtLoginService);
  });

  it('returns unauthorized when token invalid', async () => {
    const unauthorizedError: UnauthorizedError = {
      kind: 'unauthorized',
      message: 'Invalid refresh token',
      timestamp: new Date(),
    };
    jwt.verifyRefreshToken.mockReturnValue(err(unauthorizedError));

    const result = await useCase.execute({ currentRefreshToken: 'bad' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('unauthorized');
      expect(result.error.message).toBeDefined();
    }
  });

  it('returns new tokens when refresh token valid', async () => {
    jwt.verifyRefreshToken.mockReturnValue(
      ok({ userId: 'user-admin-1', role: 'Admin', businessId: 'business-1' }),
    );

    const result = await useCase.execute({
      currentRefreshToken: 'good',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.accessToken).toBe('a');
      expect(result.value.refreshToken).toBe('r');
    }
  });
});
