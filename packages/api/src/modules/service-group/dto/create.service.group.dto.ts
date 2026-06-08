import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';
import type { CreateServiceGroupInput } from '@pikslots/shared';

export class CreateServiceGroupDto implements CreateServiceGroupInput {
  @ApiProperty({ example: 'Color Services', description: 'Group name, unique per business' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'biz_01j...', description: 'Business ID to create the group under' })
  @IsString()
  @MinLength(1)
  businessId: string;
}
