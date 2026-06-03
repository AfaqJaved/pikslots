import { ApiProperty } from '@nestjs/swagger';
import type { RequestInviteOtpInput } from '@pikslots/shared';
import { IsString } from 'class-validator';

export class RequestInviteOtpDto implements RequestInviteOtpInput {
  @ApiProperty({ description: 'Signed invite JWT from the invite URL' })
  @IsString()
  token: string;
}
