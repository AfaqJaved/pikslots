import { ApiProperty } from '@nestjs/swagger';
import { UpdateBusinessBrandDetailsImagesInput } from '@pikslots/shared';
import { PikSlotsOptionalStringValidation } from 'src/shared/decorators/validations';

export class UpdateBusinessBrandDetailsImagesDto implements UpdateBusinessBrandDetailsImagesInput {
  @ApiProperty({
    example: 'banners/biz_01j/banner.jpg',
    description: 'New S3 key for the banner image',
  })
  @PikSlotsOptionalStringValidation(200)
  bannerImageKey: string;

  @ApiProperty({
    example: 'brandLogo/biz_01j/brandLogo.jpg',
    description: 'New S3 key for the brandLogo image',
  })
  @PikSlotsOptionalStringValidation(200)
  brandLogoKey: string;
}
