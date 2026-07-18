import { ApiProperty } from '@nestjs/swagger';
import { RegisterTimeoffInput } from '@pikslots/shared';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  PikSlotsStringValidation,
  PikSlotsUUIDValidation,
} from 'src/shared/decorators/validations';

export class RegisterTimeoffDto implements RegisterTimeoffInput {
  @ApiProperty({
    example: 'timeoff',
  })
  @PikSlotsStringValidation(1, 255)
  title: string;

  @ApiProperty({
    example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
    description: 'ID of the user this time-off belongs to',
  })
  @PikSlotsUUIDValidation()
  userId: string;

  @ApiProperty({
    example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7d',
    description: 'ID of the business this time-off belongs to',
  })
  @PikSlotsUUIDValidation()
  businessId: string;

  @ApiProperty({
    example: '2025-06-16T10:00:00.000Z',
    description: 'Time off start date time ISO 8601 UTC datetime string',
  })
  @IsDateString()
  startDateTime: string;

  @ApiProperty({
    example: '2025-06-16T10:00:00.000Z',
    description: 'Time off end date time ISO 8601 UTC datetime string',
  })
  @IsDateString()
  endDateTime: string;

  @ApiProperty({
    example: false,
    description: 'Whether the time off spans the full day(s)',
  })
  @IsBoolean()
  allDay: boolean;

  @ApiProperty({
    example: 'America/New_York',
    description: 'IANA timezone the time off was created in',
  })
  @IsString()
  @IsNotEmpty()
  timeZone: string;

  @ApiProperty({
    example: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
    description: 'Optional rrule recurrence string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @PikSlotsStringValidation(1, 255)
  recurrence: string | null;
}
