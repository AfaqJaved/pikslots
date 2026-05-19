import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RegisterBusinessInput,
  type BusinessIndustry,
} from '@pikslots/shared';
import {
  PikSlotsAddressValidation,
  PikSlotsEmailValidation,
  PikSlotsEnumValidation,
  PikSlotsOptionalISOCurrencyValidation,
  PikSlotsOptionalLanguageValidation,
  PikSlotsOptionalStringValidation,
  PikSlotsOptionalTimezoneValidation,
  PikSlotsOptionalUrlValidation,
  PikSlotsPhoneValidation,
  PikSlotsSlugValidation,
  PikSlotsStringValidation,
} from 'src/shared/decorators/validations';
import { IsString } from 'class-validator';

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

export class RegisterBusinessDto implements RegisterBusinessInput {
  @ApiProperty({ example: 'usr_01j...' })
  @IsString()
  ownerId: string;

  @ApiProperty({ example: 'joes-barbershop', minLength: 3, maxLength: 60 })
  @PikSlotsSlugValidation()
  slug: string;

  @ApiProperty({ example: "Joe's Barbershop", maxLength: 100 })
  @PikSlotsStringValidation(1, 100)
  name: string;

  @ApiProperty({ enum: INDUSTRIES })
  @PikSlotsEnumValidation(INDUSTRIES)
  industry: BusinessIndustry;

  @ApiProperty({ example: '123 Main St, New York, NY 10001' })
  @PikSlotsAddressValidation()
  address: string;

  @ApiProperty({ example: 'hello@joesbarbershop.com', maxLength: 100 })
  @PikSlotsEmailValidation()
  email: string;

  @ApiPropertyOptional({ example: '+12025551234' })
  @PikSlotsPhoneValidation()
  phone?: string;

  @ApiPropertyOptional({ example: 'A friendly neighbourhood barbershop.' })
  @PikSlotsOptionalStringValidation(500)
  description?: string;

  @ApiPropertyOptional({ example: 'https://joesbarbershop.com' })
  @PikSlotsOptionalUrlValidation()
  website?: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @PikSlotsOptionalTimezoneValidation()
  defaultTimeZone?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @PikSlotsOptionalISOCurrencyValidation()
  defaultCurrency?: string;

  @ApiPropertyOptional({ example: 'en' })
  @PikSlotsOptionalLanguageValidation()
  defaultLanguage?: string;
}
