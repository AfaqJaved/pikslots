import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { LoginUserInput } from '@pikslots/shared';

export class LoginUserDto implements LoginUserInput {
  @ApiProperty({ example: 'john_doe or john@example.com' })
  @IsString()
  @MinLength(1)
  usernameOrEmail: string;

  @ApiProperty({ example: 'secret123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
