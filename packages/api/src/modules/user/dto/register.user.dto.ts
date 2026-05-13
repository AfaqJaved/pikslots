import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserRole } from '@pikslots/domain';
import { IsTimezone } from 'src/shared/decorators/is.timezone';

class FullNameDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;
}

export class RegisterUserDto {
  @ApiProperty({ example: 'john_doe', minLength: 3, maxLength: 30 })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$/, {
    message:
      'username must be lowercase alphanumeric; underscores or hyphens allowed but not at start or end',
  })
  username: string;

  @ApiProperty({ example: 'john@example.com', maxLength: 100 })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({ example: 'secret123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ type: FullNameDto })
  @ValidateNested()
  @Type(() => FullNameDto)
  name: FullNameDto;

  @ApiProperty({ enum: ['superAdmin', 'businessOwner', 'locationOwner'] })
  @IsEnum([
    'superAdmin',
    'businessOwner',
    'locationOwner',
  ] as const satisfies UserRole[])
  role: UserRole;

  @ApiProperty({ example: 'America/New_York' })
  @IsTimezone()
  timezone: string;

  @ApiPropertyOptional({ example: '+12025551234' })
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'phone must be a valid E.164 number (e.g. "+12025551234")',
  })
  phone?: string;
}
