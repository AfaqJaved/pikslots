import { ApiProperty } from '@nestjs/swagger';
import type {
  UpdateBusinessAppearanceInput,
  BrandButtonShape,
  BrandTheme,
} from '@pikslots/shared';
import {
  PikSlotsEnumValidation,
  PikSlotsStringValidation,
} from 'src/shared/decorators/validations';
import { IsArray, IsString, ArrayMaxSize } from 'class-validator';

const BUTTON_SHAPES: BrandButtonShape[] = ['pill', 'rounded', 'rectangle'];
const THEMES: BrandTheme[] = ['system', 'light', 'dark'];

export class UpdateBusinessAppearanceDto implements UpdateBusinessAppearanceInput {
  @ApiProperty({ example: '#2980b9', description: 'Hex colour string' })
  @PikSlotsStringValidation(4, 9)
  brandColor: string;

  @ApiProperty({ enum: BUTTON_SHAPES })
  @PikSlotsEnumValidation(BUTTON_SHAPES)
  brandButtonShape: BrandButtonShape;

  @ApiProperty({ enum: THEMES })
  @PikSlotsEnumValidation(THEMES)
  theme: BrandTheme;

  @ApiProperty({
    type: [String],
    example: ['photos/biz_01j/photo1.jpg'],
    description: 'Up to 10 S3 gallery photo keys',
  })
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  gallaryPhotosUrls: string[];
}
