import { Injectable } from '@nestjs/common';
import { plainToInstance, Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

@Injectable()
export class Env {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;

  @IsNumber()
  @Min(1)
  PORT: number = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  BACKEND_PUBLIC_URL: string;

  @IsString()
  FRONTEND_PUBLIC_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string = '15m';

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsString()
  INVITE_JWT_SECRET: string;

  @IsString()
  INVITE_JWT_EXPIRES_IN: string = '7d';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  ENABLE_API_DOCS: boolean = false;

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((s: string) => s.trim())
      : value,
  )
  CORS_ORIGINS: string[];

  @IsString()
  REDIS_HOST: string;

  @IsString()
  REDIS_PASSWORD: string;

  @IsNumber()
  REDIS_PORT: number;

  @IsString()
  MAIL_HOST: string;

  @IsNumber()
  MAIL_PORT: number;

  @IsString()
  MAIL_USER: string;

  @IsString()
  MAIL_PASS: string;

  @IsString()
  MAIL_FROM: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  S3_ENABLED: boolean = false;

  @ValidateIf((o: Env) => o.S3_ENABLED)
  @IsString()
  S3_ACCESS_KEY: string;

  @ValidateIf((o: Env) => o.S3_ENABLED)
  @IsString()
  S3_SECRET_KEY: string;

  @ValidateIf((o: Env) => o.S3_ENABLED)
  @IsString()
  S3_BUCKET_NAME: string;

  @ValidateIf((o: Env) => o.S3_ENABLED)
  @IsString()
  S3_HOST: string;

  @ValidateIf((o: Env) => o.S3_ENABLED)
  @IsString()
  S3_REGION: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  S3_FORCED_PATH_STYLE: boolean;
}

export function validateEnv(config: Record<string, unknown>): Env {
  const env = plainToInstance(Env, config, { enableImplicitConversion: true });

  const errors = validateSync(env, { skipMissingProperties: false });

  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('\n  ');

    throw new Error(
      `[PikslotsConfigModule] Invalid environment variables:\n  ${messages}`,
    );
  }

  return env;
}
