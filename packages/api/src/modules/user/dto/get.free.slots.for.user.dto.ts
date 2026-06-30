import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PikSlotsTimezoneValidation } from 'src/shared/decorators/validations';
import type { GetFreeSlotsForUserInput } from '@pikslots/shared';

export class GetFreeSlotsForUserDto implements GetFreeSlotsForUserInput {
  @ApiProperty({
    description: 'Business ID',
    example: 'uuid',
  })
  @IsString()
  businessId: string;

  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2026-06-26',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date: string;

  @ApiProperty({
    description: 'Duration of each slot in minutes',
    example: 30,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationInMins: number;

  @ApiProperty({
    description: 'Buffer time around each booking in minutes',
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bufferTimeInMins: number;

  @ApiProperty({
    description: 'IANA timezone of the caller',
    example: 'America/New_York',
  })
  @PikSlotsTimezoneValidation()
  businessTimezone: string;
}
