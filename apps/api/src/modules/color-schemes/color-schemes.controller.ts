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
import { ColorSchemesService } from './color-schemes.service';
import {
  CreateColorSchemeDto,
  UpdateColorSchemeDto,
  AddSectionDto,
  UpdateColorSchemeSectionDto,
  AddSectionPaintDto,
  UpdateSectionPaintDto,
} from './dto/create-color-scheme.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Color Schemes')
@ApiBearerAuth()
@Controller('color-schemes')
export class ColorSchemesController {
  constructor(private readonly colorSchemesService: ColorSchemesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a color scheme for a miniature' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateColorSchemeDto) {
    return { data: await this.colorSchemesService.create(userId, dto) };
  }

  @Get('miniature/:miniatureId')
  @ApiOperation({ summary: 'Get color scheme for a miniature' })
  async findByMiniature(
    @CurrentUser('id') userId: string,
    @Param('miniatureId') miniatureId: string
  ) {
    return { data: await this.colorSchemesService.findByMiniature(userId, miniatureId) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a color scheme by ID' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return { data: await this.colorSchemesService.findOne(userId, id) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a color scheme' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateColorSchemeDto
  ) {
    return { data: await this.colorSchemesService.update(userId, id, dto) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a color scheme' })
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.colorSchemesService.remove(userId, id);
    return { message: 'Color scheme deleted successfully' };
  }

  // Section endpoints
  @Post(':schemeId/sections')
  @ApiOperation({ summary: 'Add a section to a color scheme' })
  async addSection(
    @CurrentUser('id') userId: string,
    @Param('schemeId') schemeId: string,
    @Body() dto: AddSectionDto
  ) {
    return { data: await this.colorSchemesService.addSection(userId, schemeId, dto) };
  }

  @Patch('sections/:sectionId')
  @ApiOperation({ summary: 'Update a section' })
  async updateSection(
    @CurrentUser('id') userId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateColorSchemeSectionDto
  ) {
    return { data: await this.colorSchemesService.updateSection(userId, sectionId, dto) };
  }

  @Delete('sections/:sectionId')
  @ApiOperation({ summary: 'Delete a section' })
  async removeSection(@CurrentUser('id') userId: string, @Param('sectionId') sectionId: string) {
    await this.colorSchemesService.removeSection(userId, sectionId);
    return { message: 'Section deleted successfully' };
  }

  // Section paint endpoints
  @Post('sections/:sectionId/paints')
  @ApiOperation({ summary: 'Add a paint to a section' })
  async addPaintToSection(
    @CurrentUser('id') userId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: AddSectionPaintDto
  ) {
    return { data: await this.colorSchemesService.addPaintToSection(userId, sectionId, dto) };
  }

  @Patch('section-paints/:paintId')
  @ApiOperation({ summary: 'Update a section paint' })
  async updateSectionPaint(
    @CurrentUser('id') userId: string,
    @Param('paintId') paintId: string,
    @Body() dto: UpdateSectionPaintDto
  ) {
    return { data: await this.colorSchemesService.updateSectionPaint(userId, paintId, dto) };
  }

  @Delete('section-paints/:paintId')
  @ApiOperation({ summary: 'Delete a section paint' })
  async removeSectionPaint(@CurrentUser('id') userId: string, @Param('paintId') paintId: string) {
    await this.colorSchemesService.removeSectionPaint(userId, paintId);
    return { message: 'Section paint deleted successfully' };
  }
}
