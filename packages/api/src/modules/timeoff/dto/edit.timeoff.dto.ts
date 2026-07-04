import { ApiProperty } from '@nestjs/swagger';
import { EditTimeoffInput } from '@pikslots/shared';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { PikSlotsStringValidation } from 'src/shared/decorators/validations';

export class EditTimeoffDto implements EditTimeoffInput {
  @ApiProperty({
    example: 'Edit timeoff',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({
    example: 'Summer Break',
    description: 'Title of the time-off entry',
  })
  @PikSlotsStringValidation(1, 255)
  title: string;

  @ApiProperty({
    example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7c',
    description: 'ID of the user this time-off belongs to',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: '01932b4a-5f3c-7e1d-b2a8-3c9d4e5f6a7d',
    description: 'ID of the business this time-off belongs to',
  })
  @IsUUID()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({
    example: '2025-06-16T10:00:00.000Z',
    description: 'Time off start date time ISO 8601 UTC datetime string',
  })
  @IsDateString()
  startDateTime: string;

  @ApiProperty({
    example: '2025-06-16T10:00:00.000Z',
    description: 'Time off start end date time ISO 8601 UTC datetime string',
  })
  @IsDateString()
  endDateTime: string;

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
