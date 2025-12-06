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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MiniaturesService } from './miniatures.service';
import { CreateMiniatureDto } from './dto/create-miniature.dto';
import { UpdateMiniatureDto } from './dto/update-miniature.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { MiniatureStatus } from '@prisma/client';

@ApiTags('miniatures')
@Controller('miniatures')
export class MiniaturesController {
  constructor(private readonly miniaturesService: MiniaturesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new miniature' })
  create(@Body() createMiniatureDto: CreateMiniatureDto) {
    return this.miniaturesService.create(createMiniatureDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all miniatures' })
  @ApiQuery({ name: 'status', required: false, enum: MiniatureStatus })
  @ApiQuery({ name: 'armyId', required: false })
  @ApiQuery({ name: 'faction', required: false })
  findAll(
    @Query('status') status?: MiniatureStatus,
    @Query('armyId') armyId?: string,
    @Query('faction') faction?: string
  ) {
    return this.miniaturesService.findAll({ status, armyId, faction });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get miniature counts by status' })
  getStats() {
    return this.miniaturesService.getStatsByStatus();
  }

  @Get(':id/library')
  @ApiOperation({ summary: 'Get a miniature with all library data (images, color scheme, tutorials)' })
  async findOneWithLibrary(@Param('id') id: string) {
    return { data: await this.miniaturesService.findOneWithLibrary(id) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a miniature by ID' })
  findOne(@Param('id') id: string) {
    return this.miniaturesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a miniature' })
  update(@Param('id') id: string, @Body() updateMiniatureDto: UpdateMiniatureDto) {
    return this.miniaturesService.update(id, updateMiniatureDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update miniature status' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.miniaturesService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a miniature' })
  remove(@Param('id') id: string) {
    return this.miniaturesService.remove(id);
  }
}
