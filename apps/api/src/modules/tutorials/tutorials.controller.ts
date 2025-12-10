import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TutorialsService } from './tutorials.service';
import {
  CreateTutorialDto,
  UpdateTutorialDto,
  ReorderTutorialsDto,
} from './dto/create-tutorial.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Tutorials')
@ApiBearerAuth()
@Controller('tutorials')
export class TutorialsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a tutorial for a miniature' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateTutorialDto) {
    return { data: await this.tutorialsService.create(userId, dto) };
  }

  @Get('miniature/:miniatureId')
  @ApiOperation({ summary: 'Get all tutorials for a miniature' })
  async findByMiniature(
    @CurrentUser('id') userId: string,
    @Param('miniatureId') miniatureId: string
  ) {
    return { data: await this.tutorialsService.findByMiniature(userId, miniatureId) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tutorial by ID' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return { data: await this.tutorialsService.findOne(userId, id) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tutorial' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTutorialDto
  ) {
    return { data: await this.tutorialsService.update(userId, id, dto) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tutorial' })
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.tutorialsService.remove(userId, id);
    return { message: 'Tutorial deleted successfully' };
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder tutorials for a miniature' })
  async reorder(@CurrentUser('id') userId: string, @Body() dto: ReorderTutorialsDto) {
    return { data: await this.tutorialsService.reorder(userId, dto.miniatureId, dto.tutorialIds) };
  }
}
