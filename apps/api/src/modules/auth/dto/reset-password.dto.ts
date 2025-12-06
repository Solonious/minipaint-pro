import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';
import {
  PASSWORD_REGEX,
  PASSWORD_MESSAGE,
} from '../constants/auth.constants';

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-here' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewPassword123' })
  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;
}
