import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsString, Matches, ValidateNested } from 'class-validator';

const TIME_PATTERN = /^\d{2}:\d{2}$/;

class DayHoursDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(TIME_PATTERN)
  openTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(TIME_PATTERN)
  closeTime: string;
}

export class UpdateBusinessHoursDto {
  @ApiProperty({ type: DayHoursDto })
  @ValidateNested()
  @Type(() => DayHoursDto)
  monday: DayHoursDto;
  @ApiProperty({ type: DayHoursDto })
  @ValidateNested()
  @Type(() => DayHoursDto)
  tuesday: DayHoursDto;
  @ApiProperty({ type: DayHoursDto })
  @ValidateNested()
  @Type(() => DayHoursDto)
  wednesday: DayHoursDto;
  @ApiProperty({ type: DayHoursDto })
  @ValidateNested()
  @Type(() => DayHoursDto)
  thursday: DayHoursDto;
  @ApiProperty({ type: DayHoursDto })
  @ValidateNested()
  @Type(() => DayHoursDto)
  friday: DayHoursDto;
  @ApiProperty({ type: DayHoursDto })
  @ValidateNested()
  @Type(() => DayHoursDto)
  saturday: DayHoursDto;
  @ApiProperty({ type: DayHoursDto })
  @ValidateNested()
  @Type(() => DayHoursDto)
  sunday: DayHoursDto;
}
