import { ApiProperty } from '@nestjs/swagger';
import { RegisterServiceInput } from '@pikslots/shared';
import {
  IsArray,
  ArrayMaxSize,
  IsUrl,
  IsNumber,
  IsString,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterServiceDto implements RegisterServiceInput {
  @ApiProperty({
    example: 'Haircut',
    description: 'Service title, unique per business',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'A professional haircut service' })
  @IsString()
  @MinLength(1)
  description: string;

  @ApiProperty({
    type: [String],
    example: [],
    description: 'Up to 5 image URLs',
  })
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl({}, { each: true })
  imagesUrls: string[];

  @ApiProperty({ example: 30, description: 'Service duration in minutes' })
  @IsNumber()
  @Min(1)
  durationInMins: number;

  @ApiProperty({
    example: 10,
    description: 'Buffer time between bookings in minutes',
  })
  @IsNumber()
  @Min(0)
  bufferTimeInMins: number;

  @ApiProperty({
    example: 2500,
    description: 'Cost in smallest currency unit (e.g. cents)',
  })
  @IsNumber()
  @Min(0)
  cost: number;
}
