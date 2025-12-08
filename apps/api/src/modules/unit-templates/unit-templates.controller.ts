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
import { UnitTemplatesService } from './unit-templates.service';
import { CreateUnitTemplateDto } from './dto/create-unit-template.dto';
import { UpdateUnitTemplateDto } from './dto/update-unit-template.dto';
import { GameSystem } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';

@Controller('unit-templates')
export class UnitTemplatesController {
  constructor(private readonly unitTemplatesService: UnitTemplatesService) {}

  @Post()
  @Public()
  create(@Body() createUnitTemplateDto: CreateUnitTemplateDto) {
    return this.unitTemplatesService.create(createUnitTemplateDto);
  }

  @Get()
  @Public()
  findAll(
    @Query('gameSystem') gameSystem?: GameSystem,
    @Query('faction') faction?: string,
    @Query('search') search?: string,
  ) {
    return this.unitTemplatesService.findAll({ gameSystem, faction, search });
  }

  @Get('search')
  @Public()
  search(
    @Query('q') query: string,
    @Query('gameSystem') gameSystem?: GameSystem,
  ) {
    return this.unitTemplatesService.search(query || '', gameSystem);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.unitTemplatesService.findOne(id);
  }

  @Post('find-or-create')
  @Public()
  findOrCreate(@Body() createUnitTemplateDto: CreateUnitTemplateDto) {
    return this.unitTemplatesService.findOrCreate(createUnitTemplateDto);
  }

  @Patch(':id')
  @Public()
  update(
    @Param('id') id: string,
    @Body() updateUnitTemplateDto: UpdateUnitTemplateDto,
  ) {
    return this.unitTemplatesService.update(id, updateUnitTemplateDto);
  }

  @Post(':id/increment-usage')
  @Public()
  incrementUsage(@Param('id') id: string) {
    return this.unitTemplatesService.incrementUsage(id);
  }

  @Delete(':id')
  @Public()
  remove(@Param('id') id: string) {
    return this.unitTemplatesService.remove(id);
  }
}
