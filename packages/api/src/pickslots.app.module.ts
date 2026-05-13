import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PickslotsConfigModule } from './shared/config/pickslots.config.module';
import { PickslotsDatabaseModule } from './shared/database/pickslots.database.module';
import { UserModule } from './modules/user/user.module';
import { PickslotsSecurityModule } from './shared/security/pickslots.security.module';
import { JwtVerificationMiddleware } from './shared/security/middleware/jwt.verficiation.middleware';

@Module({
  imports: [
    PickslotsSecurityModule,
    PickslotsConfigModule,
    PickslotsDatabaseModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class PickslotsAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtVerificationMiddleware).forRoutes('*');
  }
}
