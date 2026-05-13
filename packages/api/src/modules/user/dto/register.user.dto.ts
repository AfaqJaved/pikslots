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
import type { UserRole } from '@pikslots/domain';
import { IsTimezone } from 'src/shared/decorators/is.timezone';

class FullNameDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;
}

export class RegisterUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$/, {
    message:
      'username must be lowercase alphanumeric; underscores or hyphens allowed but not at start or end',
  })
  username: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @ValidateNested()
  @Type(() => FullNameDto)
  name: FullNameDto;

  @IsEnum([
    'superAdmin',
    'businessOwner',
    'locationOwner',
  ] as const satisfies UserRole[])
  role: UserRole;

  @IsTimezone()
  timezone: string;

  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'phone must be a valid E.164 number (e.g. "+12025551234")',
  })
  phone?: string;
}
