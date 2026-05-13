import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PikslotsConfigModule } from './shared/config/pikslots.config.module';
import { PikslotsDatabaseModule } from './shared/database/pikslots.database.module';
import { UserModule } from './modules/user/user.module';
import { PikslotsSecurityModule } from './shared/security/pikslots.security.module';
import { JwtVerificationMiddleware } from './shared/security/middleware/jwt.verficiation.middleware';

@Module({
  imports: [
    PikslotsSecurityModule,
    PikslotsConfigModule,
    PikslotsDatabaseModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class PikslotsAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtVerificationMiddleware).forRoutes('*');
  }
}
