import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MiniatureStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({ enum: MiniatureStatus, example: MiniatureStatus.PAINTED, description: 'New status for the miniature' })
  @IsEnum(MiniatureStatus)
  status: MiniatureStatus;
}
