import { ApiProperty } from '@nestjs/swagger';
import { EditTimeoffInput } from '@pikslots/shared';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { RecurrenceDomainDto } from './recurrence.timeoff.dto';

export class EditTimeoffDto implements EditTimeoffInput {
  @ApiProperty({
    example: 'timeoff',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  businessId: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date | undefined;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'time must be in HH:mm or HH:mm:ss format',
  })
  startTime?: string | undefined;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'time must be in HH:mm or HH:mm:ss format',
  })
  endTime?: string | undefined;

  @IsOptional()
  @ValidateNested()
  @Type(() => RecurrenceDomainDto)
  recurrence?: RecurrenceDomainDto | undefined;
}
