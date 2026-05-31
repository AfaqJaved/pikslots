import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import type { UpdateBusinessContactDetailsInput } from '@pikslots/shared';

class PhoneEntryDto {
  @ApiProperty({ example: '+92' })
  @IsString()
  countryCode: string;

  @ApiProperty({ example: '3001234567' })
  @IsString()
  number: string;
}

export class UpdateBusinessContactDetailsDto implements UpdateBusinessContactDetailsInput {
  @ApiProperty({ example: 'hello@example.com' })
  @IsString()
  primaryEmail: string;

  @ApiProperty({ type: PhoneEntryDto })
  @ValidateNested()
  @Type(() => PhoneEntryDto)
  primaryPhone: PhoneEntryDto;

  @ApiProperty({ type: [String], example: [] })
  @IsArray()
  @IsString({ each: true })
  additionalEmails: string[];

  @ApiProperty({ type: [PhoneEntryDto], example: [] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneEntryDto)
  additionalPhones: PhoneEntryDto[];
}
