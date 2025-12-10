import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UnitTemplatesService } from './unit-templates.service';
import { CreateUnitTemplateDto } from './dto/create-unit-template.dto';
import { UpdateUnitTemplateDto } from './dto/update-unit-template.dto';
import { GameSystem } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('unit-templates')
@ApiBearerAuth()
@Controller('unit-templates')
export class UnitTemplatesController {
  constructor(private readonly unitTemplatesService: UnitTemplatesService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() createUnitTemplateDto: CreateUnitTemplateDto
  ) {
    return this.unitTemplatesService.create(userId, createUnitTemplateDto);
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query('gameSystem') gameSystem?: GameSystem,
    @Query('faction') faction?: string,
    @Query('search') search?: string,
  ) {
    return this.unitTemplatesService.findAll(userId, { gameSystem, faction, search });
  }

  @Get('search')
  search(
    @CurrentUser('id') userId: string,
    @Query('q') query: string,
    @Query('gameSystem') gameSystem?: GameSystem,
  ) {
    return this.unitTemplatesService.search(userId, query || '', gameSystem);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.unitTemplatesService.findOne(userId, id);
  }

  @Post('find-or-create')
  findOrCreate(
    @CurrentUser('id') userId: string,
    @Body() createUnitTemplateDto: CreateUnitTemplateDto
  ) {
    return this.unitTemplatesService.findOrCreate(userId, createUnitTemplateDto);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateUnitTemplateDto: UpdateUnitTemplateDto,
  ) {
    return this.unitTemplatesService.update(userId, id, updateUnitTemplateDto);
  }

  @Post(':id/increment-usage')
  incrementUsage(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.unitTemplatesService.incrementUsage(userId, id);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.unitTemplatesService.remove(userId, id);
  }
}
