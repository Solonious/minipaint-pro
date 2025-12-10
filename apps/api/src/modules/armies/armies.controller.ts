import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ArmiesService } from './armies.service';
import { CreateArmyDto } from './dto/create-army.dto';
import { UpdateArmyDto } from './dto/update-army.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('armies')
@ApiBearerAuth()
@Controller('armies')
export class ArmiesController {
  constructor(private readonly armiesService: ArmiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new army' })
  create(@CurrentUser('id') userId: string, @Body() createArmyDto: CreateArmyDto) {
    return this.armiesService.create(userId, createArmyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all armies with stats' })
  findAll(@CurrentUser('id') userId: string) {
    return this.armiesService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an army by ID with stats' })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.armiesService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an army' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateArmyDto: UpdateArmyDto
  ) {
    return this.armiesService.update(userId, id, updateArmyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an army' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.armiesService.remove(userId, id);
  }
}
