import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TutorialsService } from './tutorials.service';
import {
  CreateTutorialDto,
  UpdateTutorialDto,
  ReorderTutorialsDto,
} from './dto/create-tutorial.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Tutorials')
@Controller('tutorials')
@Public()
export class TutorialsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a tutorial for a miniature' })
  async create(@Body() dto: CreateTutorialDto) {
    return { data: await this.tutorialsService.create(dto) };
  }

  @Get('miniature/:miniatureId')
  @ApiOperation({ summary: 'Get all tutorials for a miniature' })
  async findByMiniature(@Param('miniatureId') miniatureId: string) {
    return { data: await this.tutorialsService.findByMiniature(miniatureId) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tutorial by ID' })
  async findOne(@Param('id') id: string) {
    return { data: await this.tutorialsService.findOne(id) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tutorial' })
  async update(@Param('id') id: string, @Body() dto: UpdateTutorialDto) {
    return { data: await this.tutorialsService.update(id, dto) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tutorial' })
  async remove(@Param('id') id: string) {
    await this.tutorialsService.remove(id);
    return { message: 'Tutorial deleted successfully' };
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder tutorials for a miniature' })
  async reorder(@Body() dto: ReorderTutorialsDto) {
    return { data: await this.tutorialsService.reorder(dto.miniatureId, dto.tutorialIds) };
  }
}
