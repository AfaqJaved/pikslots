import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshUserSessionDto {
  @ApiProperty({ example: '<jwt>' })
  @IsString()
  currentRefreshToken: string;
}
