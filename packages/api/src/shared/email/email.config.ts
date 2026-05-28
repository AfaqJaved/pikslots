import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { Env } from '../config/env';

export const EmailConfigModule = MailerModule.forRootAsync({
  useFactory: (config: ConfigService<Env, true>) => ({
    transport: {
      host: config.get('MAIL_HOST'),
      port: config.get('MAIL_PORT'),
      secure: false,
      auth: {
        user: config.get('MAIL_USER'),
        pass: config.get('MAIL_PASS'),
      },
    },
    defaults: {
      from: config.get('MAIL_FROM'),
    },
    template: {
      dir: join(__dirname, 'templates'),
      adapter: new HandlebarsAdapter(),
      options: { strict: true },
    },
  }),
  inject: [ConfigService],
});
