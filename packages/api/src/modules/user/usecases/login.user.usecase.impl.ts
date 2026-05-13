import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  InfrastructureError,
  IUserRepository,
  LoginUserUseCase,
  ok,
  Result,
} from '@pickslots/domain';
import type {
  LoginUserCommand,
  UnauthorizedError,
  User,
  UserRepository,
} from '@pickslots/domain';
import { PasswordHashingService } from 'src/shared/security/hashing/password.hashing.service';
import {
  JwtLoginService,
  LoginJwtPayload,
} from 'src/shared/security/jwt/jwt.login.service';

type LoginError = UnauthorizedError | InfrastructureError;
type LoginResult = Result<
  { accessToken: string; refreshToken: string },
  LoginError
>;

const ACCESS_DENIED = (): UnauthorizedError => ({
  kind: 'unauthorized',
  message: 'Access denied',
  timestamp: new Date(),
});

@Injectable()
export class LoginUserUseCaseImpl implements LoginUserUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: UserRepository,
    private readonly jwtLoginService: JwtLoginService,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginResult> {
    const user = await this.findUser(command.usernameOrEmail);
    if (!user.ok) return user;

    const passwordMatches = await this.passwordHashingService.compare(
      command.password,
      user.value.password,
    );
    if (!passwordMatches) return err(ACCESS_DENIED());

    return this.issueTokens(user.value);
  }

  private async findUser(
    usernameOrEmail: string,
  ): Promise<Result<User, LoginError>> {
    const isEmail = usernameOrEmail.includes('@');

    const result = isEmail
      ? await this.userRepository.findByEmail(usernameOrEmail)
      : await this.userRepository.findByUsername(usernameOrEmail);

    // for security should be access denied rather user not found
    if (!result.ok) return err(ACCESS_DENIED());
    if (!result.value) return err(ACCESS_DENIED());

    return ok(result.value);
  }

  private issueTokens(user: User): LoginResult {
    const payload: LoginJwtPayload = { userId: user.id, role: user.role };
    return ok({
      accessToken: this.jwtLoginService.signAccessToken(payload),
      refreshToken: this.jwtLoginService.signRefreshToken(payload),
    });
  }
}
