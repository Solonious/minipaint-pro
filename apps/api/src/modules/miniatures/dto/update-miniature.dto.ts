import { PartialType } from '@nestjs/swagger';
import { CreateMiniatureDto } from './create-miniature.dto';

export class UpdateMiniatureDto extends PartialType(CreateMiniatureDto) {}
