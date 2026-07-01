import { ApiPropertyOptional } from '@nestjs/swagger';
import type { UpdateBreakRequest } from '@pikslots/shared';
import type { WeekDay } from '@pikslots/shared';
import {
  PikSlotsOptionalTimeValidation,
  PikSlotsOptionalWeekDayValidation,
} from 'src/shared/decorators/validations';

export class UpdateBreakDto implements UpdateBreakRequest {
  @ApiPropertyOptional({
    example: 'tuesday',
    enum: [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ],
  })
  @PikSlotsOptionalWeekDayValidation()
  day: WeekDay;

  @ApiPropertyOptional({
    example: '10:00',
    description: 'Start time in HH:mm format',
  })
  @PikSlotsOptionalTimeValidation()
  startTime: string;

  @ApiPropertyOptional({
    example: '10:30',
    description: 'End time in HH:mm format',
  })
  @PikSlotsOptionalTimeValidation()
  endTime: string;
}
