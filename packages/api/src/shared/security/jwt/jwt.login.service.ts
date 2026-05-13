import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { UserRole } from '@pickslots/domain';
import * as jwt from 'jsonwebtoken';
import { Env } from 'src/shared/config/env';

export interface LoginJwtPayload {
  userId: string;
  role: UserRole;
}

@Injectable()
export class JwtLoginService {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  private get accessSecret(): string {
    return this.configService.getOrThrow('JWT_SECRET', { infer: true });
  }

  private get refreshSecret(): string {
    return this.configService.getOrThrow('JWT_REFRESH_SECRET', { infer: true });
  }

  signAccessToken(payload: LoginJwtPayload): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.configService.getOrThrow('JWT_EXPIRES_IN', { infer: true }),
    });
  }

  verifyAccessToken(token: string): LoginJwtPayload {
    return jwt.verify(token, this.accessSecret) as LoginJwtPayload;
  }

  signRefreshToken(payload: LoginJwtPayload): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN', { infer: true }),
    });
  }

  verifyRefreshToken(token: string): LoginJwtPayload {
    return jwt.verify(token, this.refreshSecret) as LoginJwtPayload;
  }
}
