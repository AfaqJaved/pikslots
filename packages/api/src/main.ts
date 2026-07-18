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

  const corsOrigins = config.get('CORS_ORIGINS', { infer: true });
  const corsOriginMatchers = corsOrigins.map(
    (pattern) =>
      new RegExp(
        `^${pattern
          .split('*')
          .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('.*')}$`,
      ),
  );

  app.enableCors({
    origin: (origin, callback) => {
      // requests with no origin (e.g. curl, server-to-server) are allowed
      if (!origin || corsOriginMatchers.some((re) => re.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  });

  const enableApiDocs = config.get('ENABLE_API_DOCS', { infer: true });

  if (enableApiDocs) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Pikslots')
      .setDescription('pikslots swagger api')
      .setVersion('1.0')
      .addBearerAuth()
      .addSecurityRequirements('bearer')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
}

bootstrap();
