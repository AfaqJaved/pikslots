import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { PikslotsAppModule } from './pikslots.app.module';
import { type Env } from './shared/config/env';
import { PrintLoadedEnv } from './shared/config/print.env';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { validationExceptionFactory } from './shared/pipes/validation.exception.factory';

async function bootstrap() {
  const app = await NestFactory.create(PikslotsAppModule);

  //validation pipe global
  app.useGlobalPipes(
    new ValidationPipe({ exceptionFactory: validationExceptionFactory }),
  );

  // printing the loaded env variables
  app.get(PrintLoadedEnv).logEnv();

  app.use(cookieParser());

  const config = app.get(ConfigService<Env, true>);

  app.enableCors({
    origin: config.get('CORS_ORIGINS', { infer: true }),
    credentials: true,
  });

  const enableApiDocs = config.get('ENABLE_API_DOCS', { infer: true });

  if (enableApiDocs) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Pikslots')
      .setDescription('pikslots swagger api')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
}
bootstrap();
