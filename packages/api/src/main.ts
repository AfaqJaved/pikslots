import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PickslotsAppModule } from './pickslots.app.module';
import { type Env } from './shared/config/env';
import { PrintLoadedEnv } from './shared/config/print.env';

async function bootstrap() {
  const app = await NestFactory.create(PickslotsAppModule);
  app.get(PrintLoadedEnv).logEnv(); // printing the loaded env variables

  const config = app.get(ConfigService<Env, true>);
  const port = config.get('PORT', { infer: true });
  await app.listen(port);
}
bootstrap();
