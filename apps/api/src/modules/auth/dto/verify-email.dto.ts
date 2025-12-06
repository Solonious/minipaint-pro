import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: 'verification-token-here' })
  @IsString()
  token: string;
}
