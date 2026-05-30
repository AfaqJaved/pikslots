import { ApiProperty } from '@nestjs/swagger';
import type { UpdateBusinessGeneralInput } from '@pikslots/shared';
import { PikSlotsStringValidation } from 'src/shared/decorators/validations';

export class UpdateBusinessGeneralDto implements UpdateBusinessGeneralInput {
  @ApiProperty({ example: 'en', description: 'BCP-47 language code' })
  @PikSlotsStringValidation(2, 10)
  language: string;
}
