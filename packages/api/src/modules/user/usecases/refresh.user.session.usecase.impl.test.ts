import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { RefreshUserSessionUseCaseImpl } from './refresh.user.session.usecase.impl';
import { JwtLoginService } from 'src/shared/security/jwt/jwt.login.service';

describe('RefreshUserSessionUseCaseImpl', () => {
  let useCase: RefreshUserSessionUseCaseImpl;

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
  });

  it('returns unauthorized when token invalid', async () => {
    const jwt = (useCase as any)
      .jwtLoginService as jest.Mocked<JwtLoginService>;
    jwt.verifyRefreshToken.mockReturnValue({
      ok: false,
      error: { kind: 'unauthorized' },
    } as any);

    const result = await useCase.execute({ currentRefreshToken: 'bad' } as any);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('unauthorized');
      if ((result.error as any).message)
        expect((result.error as any).message).toBeDefined();
    }
  });

  it('returns new tokens when refresh token valid', async () => {
    const jwt = (useCase as any)
      .jwtLoginService as jest.Mocked<JwtLoginService>;
    jwt.verifyRefreshToken.mockReturnValue({
      ok: true,
      value: { userId: 'user-admin-1' },
    } as any);

    const result = await useCase.execute({
      currentRefreshToken: 'good',
    } as any);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.accessToken).toBe('a');
      expect(result.value.refreshToken).toBe('r');
    }
  });
});
