import { Type } from 'class-transformer';
import { IsEnum, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  FullNameInput,
  RegisterUserInput,
  type UserRole,
} from '@pikslots/shared';
import {
  PikSlotsEmailValidation,
  PikSlotsEnumValidation,
  PikSlotsPasswordValidation,
  PikSlotsPhoneValidation,
  PikSlotsStringValidation,
  PikSlotsTimezoneValidation,
  PikSlotsUsernameValidation,
} from 'src/shared/decorators/validations';

export class FullNameDto implements FullNameInput {
  @ApiProperty({ example: 'John' })
  @PikSlotsStringValidation(1, 50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @PikSlotsStringValidation(1, 50)
  lastName: string;
}

export class RegisterUserDto implements RegisterUserInput {
  @ApiProperty({ example: 'john_doe', minLength: 3, maxLength: 30 })
  @PikSlotsUsernameValidation()
  username: string;

  @ApiProperty({ example: 'john@example.com', maxLength: 100 })
  @PikSlotsEmailValidation()
  email: string;

  @ApiProperty({ example: 'secret123', minLength: 8 })
  @PikSlotsPasswordValidation()
  password: string;

  @ApiProperty({ type: FullNameDto })
  @ValidateNested()
  @Type(() => FullNameDto)
  name: FullNameDto;

  @ApiProperty({ enum: ['superAdmin', 'businessOwner', 'locationOwner'] })
  @PikSlotsEnumValidation([
    'superAdmin',
    'businessOwner',
    'locationOwner',
  ] as const satisfies UserRole[])
  role: UserRole;

  @ApiProperty({ example: 'America/New_York' })
  @PikSlotsTimezoneValidation()
  timezone: string;

  @ApiPropertyOptional({ example: '+12025551234' })
  @PikSlotsPhoneValidation()
  phone?: string;
}
