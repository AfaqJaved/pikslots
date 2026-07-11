import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import type { UpdateUserAvatarInput } from '@pikslots/shared';

export class UpdateUserAvatarDto implements UpdateUserAvatarInput {
  @ApiProperty({
    example: 'acme-biz/users/usr_01j/avatar/avatar.png',
    description: 'The S3 key of the uploaded avatar file',
  })
  @IsString()
  @IsNotEmpty()
  avatarKey: string;
}
