import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import type { UpdateBreakInput } from '@pikslots/shared';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const TIME_FORMAT_MESSAGE = 'Time must be in HH:MM 24-hour format (e.g. 09:00)';

export class UpdateBreakDto implements UpdateBreakInput {
  @ApiProperty({ example: '10:00' })
  @IsString()
  @Matches(TIME_REGEX, { message: TIME_FORMAT_MESSAGE })
  startTime!: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  @Matches(TIME_REGEX, { message: TIME_FORMAT_MESSAGE })
  endTime!: string;
}
