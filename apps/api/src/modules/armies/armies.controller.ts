import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ArmiesService } from './armies.service';
import { CreateArmyDto } from './dto/create-army.dto';
import { UpdateArmyDto } from './dto/update-army.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('armies')
@Controller('armies')
@Public()
export class ArmiesController {
  constructor(private readonly armiesService: ArmiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new army' })
  create(@Body() createArmyDto: CreateArmyDto) {
    return this.armiesService.create(createArmyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all armies with stats' })
  findAll() {
    return this.armiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an army by ID with stats' })
  findOne(@Param('id') id: string) {
    return this.armiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an army' })
  update(@Param('id') id: string, @Body() updateArmyDto: UpdateArmyDto) {
    return this.armiesService.update(id, updateArmyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an army' })
  remove(@Param('id') id: string) {
    return this.armiesService.remove(id);
  }
}
