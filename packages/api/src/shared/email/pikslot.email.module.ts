import { Global, Module } from '@nestjs/common';
import { EmailConfigModule } from './email.config';
import { PikslotEmailService } from './pikslot.email.service';

@Global()
@Module({
  imports: [EmailConfigModule],
  providers: [PikslotEmailService],
  exports: [EmailConfigModule, PikslotEmailService],
})
export class PikslotEmailModule {}
