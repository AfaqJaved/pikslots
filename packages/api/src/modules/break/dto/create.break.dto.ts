import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Matches } from 'class-validator';
import type { CreateBreakInput } from '@pikslots/shared';
import type { BreakDay } from '@pikslots/domain';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const TIME_FORMAT_MESSAGE = 'Time must be in HH:MM 24-hour format (e.g. 09:00)';

const BREAK_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export class CreateBreakDto implements CreateBreakInput {
  @ApiProperty({ example: 'monday', enum: BREAK_DAYS })
  @IsEnum(BREAK_DAYS, { message: 'day must be a valid day of the week' })
  day!: BreakDay;

  @ApiProperty({ example: '10:00' })
  @IsString()
  @Matches(TIME_REGEX, { message: TIME_FORMAT_MESSAGE })
  startTime!: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  @Matches(TIME_REGEX, { message: TIME_FORMAT_MESSAGE })
  endTime!: string;
}
