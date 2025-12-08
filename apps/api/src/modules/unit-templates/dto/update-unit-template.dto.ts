import { PartialType } from '@nestjs/mapped-types';
import { CreateUnitTemplateDto } from './create-unit-template.dto';

export class UpdateUnitTemplateDto extends PartialType(CreateUnitTemplateDto) {}
