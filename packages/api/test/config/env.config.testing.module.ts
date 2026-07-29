import { join } from 'node:path';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from 'src/shared/config/env';

/**
 * The app's own PikslotsConfigModule hardcodes envFilePath to the dev .env,
 * which would make this suite silently depend on (and drift with) dev's
 * config. Swapped in below via .overrideModule() so the suite always reads
 * its own .test.env through the real ConfigService instead.
 *
 * envFilePath is resolved from this file's own location (via __dirname)
 * rather than a bare relative path, since dotenv otherwise resolves
 * relative paths against process.cwd() — which changes depending on where
 * the test command is invoked from (package dir vs. repo root).
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '../../../../.test.env'),
      validate: validateEnv,
      isGlobal: true,
      cache: true,
    }),
  ],
})
export class E2eTestConfigModule {}
