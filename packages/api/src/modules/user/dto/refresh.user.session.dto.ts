import { ApiProperty } from '@nestjs/swagger';
import { RefreshUserSessionInput } from '@pikslots/shared';
import { PikSlotsStringValidation } from 'src/shared/decorators/validations';

export class RefreshUserSessionDto implements RefreshUserSessionInput {
  @ApiProperty({ example: '<jwt>' })
  @PikSlotsStringValidation(1, 2048)
  currentRefreshToken: string;
}
