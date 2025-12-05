import { IsEnum } from 'class-validator';
import { MiniatureStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(MiniatureStatus)
  status: MiniatureStatus;
}
