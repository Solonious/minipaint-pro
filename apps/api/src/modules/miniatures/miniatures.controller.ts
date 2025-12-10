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
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MiniaturesService } from './miniatures.service';
import { CreateMiniatureDto } from './dto/create-miniature.dto';
import { UpdateMiniatureDto } from './dto/update-miniature.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { MoveModelsDto } from './dto/move-models.dto';
import { MiniatureStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('miniatures')
@ApiBearerAuth()
@Controller('miniatures')
export class MiniaturesController {
  constructor(private readonly miniaturesService: MiniaturesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new miniature' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createMiniatureDto: CreateMiniatureDto
  ) {
    return this.miniaturesService.create(userId, createMiniatureDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all miniatures' })
  @ApiQuery({ name: 'status', required: false, enum: MiniatureStatus })
  @ApiQuery({ name: 'armyId', required: false })
  @ApiQuery({ name: 'faction', required: false })
  findAll(
    @CurrentUser('id') userId: string,
    @Query('status') status?: MiniatureStatus,
    @Query('armyId') armyId?: string,
    @Query('faction') faction?: string
  ) {
    return this.miniaturesService.findAll(userId, { status, armyId, faction });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get miniature counts by status' })
  getStats(@CurrentUser('id') userId: string) {
    return this.miniaturesService.getStatsByStatus(userId);
  }

  @Get(':id/library')
  @ApiOperation({ summary: 'Get a miniature with all library data (images, color scheme, tutorials)' })
  async findOneWithLibrary(
    @CurrentUser('id') userId: string,
    @Param('id') id: string
  ) {
    return { data: await this.miniaturesService.findOneWithLibrary(userId, id) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a miniature by ID' })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.miniaturesService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a miniature' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateMiniatureDto: UpdateMiniatureDto
  ) {
    return this.miniaturesService.update(userId, id, updateMiniatureDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update miniature status' })
  updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto
  ) {
    return this.miniaturesService.updateStatus(userId, id, updateStatusDto);
  }

  @Post(':id/increment-completed')
  @ApiOperation({ summary: 'Increment the number of completed models by 1' })
  incrementCompleted(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.miniaturesService.incrementCompleted(userId, id);
  }

  @Post(':id/decrement-completed')
  @ApiOperation({ summary: 'Decrement the number of completed models by 1' })
  decrementCompleted(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.miniaturesService.decrementCompleted(userId, id);
  }

  @Post(':id/move-models')
  @ApiOperation({ summary: 'Move models between stages' })
  moveModels(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() moveModelsDto: MoveModelsDto
  ) {
    return this.miniaturesService.moveModels(userId, id, moveModelsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a miniature' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.miniaturesService.remove(userId, id);
  }
}
