import { ApiProperty } from '@nestjs/swagger';
import { UpdateCustomerProfileImageInput } from '@pikslots/shared';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateCustomerProfileImageDto implements UpdateCustomerProfileImageInput {
  @ApiProperty({
    example: 'avatars/cus_01j/abc123.jpg',
    description: 'New S3 key for the profile image',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  profileImageKey: string;
}
