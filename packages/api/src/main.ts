import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { PikslotsAppModule } from './pikslots.app.module';
import { type Env } from './shared/config/env';
import { PrintLoadedEnv } from './shared/config/print.env';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(PikslotsAppModule);
  app.get(PrintLoadedEnv).logEnv(); // printing the loaded env variables

  app.use(cookieParser());

  //cors settings
  app.enableCors({ origin: 'http://localhost:5173', credentials: true });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pikslots')
    .setDescription('pikslots swagger api')
    .setVersion('1.0')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  // SwaggerModule.setup('api', app, documentFactory);

  app.use('/api', apiReference({ content: documentFactory() }));

  const config = app.get(ConfigService<Env, true>);
  const port = config.get('PORT', { infer: true });
  await app.listen(port);
}
bootstrap();
