import { Global, Module } from '@nestjs/common';
import { SecurityContext } from './context/security.context';
import { PasswordHashingService } from './hashing/password.hashing.service';
import { JwtLoginService } from './jwt/jwt.login.service';
import { JwtVerificationMiddleware } from './middleware/jwt.verficiation.middleware';

@Global()
@Module({
  providers: [
    JwtLoginService,
    JwtVerificationMiddleware,
    SecurityContext,
    PasswordHashingService,
  ],
  exports: [
    JwtLoginService,
    JwtVerificationMiddleware,
    SecurityContext,
    PasswordHashingService,
  ],
})
export class PikslotsSecurityModule {}
