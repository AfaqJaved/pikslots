import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import type { GetPresignedUploadUrlInput } from '@pikslots/shared';

export class GetPresignedUploadUrlDto implements GetPresignedUploadUrlInput {
  @ApiProperty({
    example: 'avatar.png',
    description: 'The name of the file to upload',
  })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({
    example: 'image/png',
    description: 'MIME type of the file (e.g. image/png, application/pdf)',
  })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({
    example: 'businesses/biz_01j/avatars',
    description: 'Destination path in the bucket (no leading or trailing slash)',
  })
  @IsString()
  @IsNotEmpty()
  path: string;
}
