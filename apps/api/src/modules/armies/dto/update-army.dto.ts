import { PartialType } from '@nestjs/swagger';
import { CreateArmyDto } from './create-army.dto';

export class UpdateArmyDto extends PartialType(CreateArmyDto) {}
