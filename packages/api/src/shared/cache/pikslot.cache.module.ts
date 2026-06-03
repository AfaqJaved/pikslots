import { Global, Module } from '@nestjs/common';
import { Cacheable } from 'cacheable';
import { createKeyv } from '@keyv/redis';
import { ConfigService } from '@nestjs/config';
import { Env } from '../config/env';
import { OtpService } from './otp/otp.service';
import { CACHE } from './cache.tokens';

@Global()
@Module({
  providers: [
    {
      provide: CACHE,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const secondary = createKeyv(
          `redis://:${config.get('REDIS_PASSWORD')}@${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
          { namespace: 'cache' },
        );
        return new Cacheable({ secondary, ttl: '4h' });
      },
    },
    OtpService,
  ],
  exports: [CACHE, OtpService],
})
export class PikslotCacheModule {}
