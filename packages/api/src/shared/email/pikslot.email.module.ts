import { Global, Module } from '@nestjs/common';
import { EmailConfigModule } from './email.config';

@Global()
@Module({
  imports: [EmailConfigModule],
  exports: [EmailConfigModule],
})
export class PikslotEmailModule {}
