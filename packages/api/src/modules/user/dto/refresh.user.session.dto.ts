import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { RefreshUserSessionInput } from '@pikslots/shared';

export class RefreshUserSessionDto implements RefreshUserSessionInput {
  @ApiProperty({ example: '<jwt>' })
  @IsString()
  currentRefreshToken: string;
}
