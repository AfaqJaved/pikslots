import { ApiProperty } from '@nestjs/swagger';
import { UpdateBusinessGalleryPhotosInput } from '@pikslots/shared';
import { IsArray, IsString, ArrayMaxSize, ArrayMinSize } from 'class-validator';

export class UpdateBusinessGalleryPhotosDto implements UpdateBusinessGalleryPhotosInput {
  @ApiProperty({
    type: [String],
    example: ['photos/biz_01j/photo1.jpg', 'photos/biz_01j/photo2.jpg'],
    description: 'New S3 keys for gallery photos (max 10)',
  })
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  galleryPhotosKeys: string[];
}
