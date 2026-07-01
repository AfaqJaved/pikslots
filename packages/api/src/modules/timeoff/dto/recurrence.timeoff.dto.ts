import type {
  recurrenceDomain,
  RecurrenceFrequency,
  recurrenceType,
  WeekDays,
} from '@pikslots/domain';
import {
  RecurrenceDomain,
  RecurrenceDomainCustom,
  weekday,
  RecurencyFrequencyEnum,
} from '@pikslots/shared';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class RecurrenceCustomDto implements RecurrenceDomainCustom {
  @IsNumber()
  @IsOptional()
  interval: number | undefined;

  @IsBoolean()
  @IsOptional()
  day?: boolean | undefined;

  @IsOptional()
  @IsEnum(weekday)
  weekly_days?: WeekDays[] | undefined;

  @IsOptional()
  @IsIn([1, 2, 3, 4, -1])
  monthly_week_of_month?: 1 | 2 | 3 | 4 | -1;

  @IsOptional()
  @IsEnum(weekday)
  monthly_weekday: weekday | undefined;

  @IsBoolean()
  @IsOptional()
  repeat_annually?: boolean | undefined;
}

export class RecurrenceDto implements RecurrenceDomain {
  @IsEnum(RecurencyFrequencyEnum)
  frequency: RecurrenceFrequency;

  @ValidateNested()
  @Type(() => RecurrenceCustomDto)
  custom: RecurrenceCustomDto;

  @IsOptional()
  @IsEnum(weekday)
  weekly_day?: WeekDays;

  @IsOptional()
  @IsIn([1, 2, 3, 4, -1])
  monthly_week_of_month?: 1 | 2 | 3 | 4 | -1;

  @IsOptional()
  @IsEnum(weekday)
  monthly_weekday?: WeekDays;

  @IsOptional()
  @IsInt()
  annually_month?: number;

  @IsOptional()
  @IsInt()
  annually_day?: number;

  @IsOptional()
  @IsEnum(['never', 'on', 'after'])
  end?: 'never' | 'on' | 'after';

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  on?: Date;

  @IsOptional()
  @IsInt()
  after?: number;
}

export class RecurrenceDomainDto implements recurrenceDomain {
  @IsEnum(['standard', 'custom'])
  recurrenceType: recurrenceType;

  @ValidateNested()
  @Type(() => RecurrenceDto)
  recurrenceRule: RecurrenceDto;
}
