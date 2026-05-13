import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './env';
import { PrintLoadedEnv } from './print.env';

@Global()
@Module({
  providers: [PrintLoadedEnv],
  exports: [PrintLoadedEnv],
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '../../.env'],
      validate: validateEnv,
      isGlobal: true,
      cache: true,
    }),
  ],
})
export class PickslotsConfigModule {}
