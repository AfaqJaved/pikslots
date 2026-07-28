import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { UpdateServiceAvatarInput } from '@pikslots/shared';

export class UpdateServiceAvatarDto implements UpdateServiceAvatarInput {
  @ApiProperty({
    example: 'acme-biz/service/uuid/avatar/avatar.png',
    description: 'The S3 key of the uploaded service avatar file',
  })
  @IsString()
  @IsNotEmpty()
  avatarKey: string;
}
