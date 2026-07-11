import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './env';

@Injectable()
export class PrintLoadedEnv {
  private readonly logger: Logger = new Logger(PrintLoadedEnv.name);
  private readonly sensitiveKeys: Array<keyof Env> = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'INVITE_JWT_SECRET',
    'INVITE_JWT_EXPIRES_IN',
    'REDIS_PASSWORD',
    'MAIL_HOST',
    'MAIL_PORT',
    'MAIL_PASS',
    'MAIL_USER',
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
  ];

  private readonly envKeys: Array<keyof Env> = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'JWT_REFRESH_EXPIRES_IN',
    'JWT_REFRESH_SECRET',
    'INVITE_JWT_SECRET',
    'INVITE_JWT_EXPIRES_IN',
    'CORS_ORIGINS',
    'REDIS_HOST',
    'REDIS_PORT',
    'MAIL_HOST',
    'MAIL_PORT',
    'MAIL_USER',
    'MAIL_PASS',
    'MAIL_FROM',
    'FRONTEND_PUBLIC_URL',
    'BACKEND_PUBLIC_URL',
    'ENABLE_API_DOCS',
    'S3_ENABLED',
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
    'S3_HOST',
    'S3_REGION',
    'S3_FORCED_PATH_STYLE',
    'S3_BUCKET_NAME',
  ];

  constructor(private readonly configService: ConfigService<Env, true>) {}

  public logEnv(): void {
    this.logger.log('Loaded environment variables:');
    for (const key of this.envKeys) {
      const raw = String(this.configService.get(key, { infer: true }));
      const value = this.sensitiveKeys.includes(key)
        ? '*'.repeat(raw.length)
        : raw;
      this.logger.log(`${key} = ${value}`);
    }
  }
}
