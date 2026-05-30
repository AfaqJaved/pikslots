import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  UpdateBusinessBrandDetailsInput,
  BusinessIndustry,
} from '@pikslots/shared';
import {
  PikSlotsEnumValidation,
  PikSlotsSlugValidation,
  PikSlotsStringValidation,
} from 'src/shared/decorators/validations';

const INDUSTRIES: BusinessIndustry[] = [
  'salon_and_beauty',
  'health_and_wellness',
  'fitness',
  'medical',
  'education',
  'legal',
  'financial',
  'hospitality',
  'retail',
  'other',
];

export class UpdateBusinessBrandDetailsDto implements UpdateBusinessBrandDetailsInput {
  @ApiPropertyOptional({ example: 'https://cdn.example.com/banner.jpg' })
  bannerImageUrl: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  logoUrl: string;

  @ApiProperty({ example: "Joe's Barbershop", maxLength: 100 })
  @PikSlotsStringValidation(1, 100)
  name: string;

  @ApiProperty({ example: 'joes-barbershop', minLength: 3, maxLength: 60 })
  @PikSlotsSlugValidation()
  slug: string;

  @ApiProperty({ enum: INDUSTRIES })
  @PikSlotsEnumValidation(INDUSTRIES)
  industry: BusinessIndustry;

  @ApiPropertyOptional({
    example: 'We are a premium barbershop...',
    maxLength: 1000,
  })
  @PikSlotsStringValidation(0, 1000)
  about: string;
}
