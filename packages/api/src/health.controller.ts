import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('/health')
export class HealtController {
  @Get('')
  healthCheck(): { status: 'up'; message: 'pikslots api is working' } {
    return {
      status: 'up',
      message: 'pikslots api is working',
    };
  }
}
