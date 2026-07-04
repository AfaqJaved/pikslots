import { ApiProperty } from '@nestjs/swagger';
import { RegisterTimeoffInput } from '@pikslots/shared';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import {
  PikSlotsOptionalTimeValidation,
  PikSlotsStringValidation,
} from 'src/shared/decorators/validations';

export class RegisterTimeoffDto implements RegisterTimeoffInput {
  @ApiProperty({
    example: 'timeoff',
  })
  @PikSlotsStringValidation(1, 255)
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
  endDate: Date | null;

  @PikSlotsOptionalTimeValidation()
  startTime: string | null;

  @PikSlotsOptionalTimeValidation()
  endTime: string | null;

  @IsOptional()
  @PikSlotsStringValidation(1, 255)
  recurrence: string | null;
}
