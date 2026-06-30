import { ApiProperty } from '@nestjs/swagger';
import { LoginUserInput } from '@pikslots/shared';
import {
  PikSlotsPasswordValidation,
  PikSlotsStringValidation,
} from 'src/shared/decorators/validations';

export class LoginUserDto implements LoginUserInput {
  @ApiProperty({ example: 'afaqjaved' })
  @PikSlotsStringValidation(1, 100)
  usernameOrEmail: string;

  @ApiProperty({ example: 'admin12345', minLength: 8 })
  @PikSlotsPasswordValidation()
  password: string;
}
