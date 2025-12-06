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
import { ColorSchemesService } from './color-schemes.service';
import {
  CreateColorSchemeDto,
  UpdateColorSchemeDto,
  AddSectionDto,
  UpdateColorSchemeSectionDto,
  AddSectionPaintDto,
  UpdateSectionPaintDto,
} from './dto/create-color-scheme.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Color Schemes')
@Controller('color-schemes')
@Public()
export class ColorSchemesController {
  constructor(private readonly colorSchemesService: ColorSchemesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a color scheme for a miniature' })
  async create(@Body() dto: CreateColorSchemeDto) {
    return { data: await this.colorSchemesService.create(dto) };
  }

  @Get('miniature/:miniatureId')
  @ApiOperation({ summary: 'Get color scheme for a miniature' })
  async findByMiniature(@Param('miniatureId') miniatureId: string) {
    return { data: await this.colorSchemesService.findByMiniature(miniatureId) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a color scheme by ID' })
  async findOne(@Param('id') id: string) {
    return { data: await this.colorSchemesService.findOne(id) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a color scheme' })
  async update(@Param('id') id: string, @Body() dto: UpdateColorSchemeDto) {
    return { data: await this.colorSchemesService.update(id, dto) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a color scheme' })
  async remove(@Param('id') id: string) {
    await this.colorSchemesService.remove(id);
    return { message: 'Color scheme deleted successfully' };
  }

  // Section endpoints
  @Post(':schemeId/sections')
  @ApiOperation({ summary: 'Add a section to a color scheme' })
  async addSection(@Param('schemeId') schemeId: string, @Body() dto: AddSectionDto) {
    return { data: await this.colorSchemesService.addSection(schemeId, dto) };
  }

  @Patch('sections/:sectionId')
  @ApiOperation({ summary: 'Update a section' })
  async updateSection(
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateColorSchemeSectionDto
  ) {
    return { data: await this.colorSchemesService.updateSection(sectionId, dto) };
  }

  @Delete('sections/:sectionId')
  @ApiOperation({ summary: 'Delete a section' })
  async removeSection(@Param('sectionId') sectionId: string) {
    await this.colorSchemesService.removeSection(sectionId);
    return { message: 'Section deleted successfully' };
  }

  // Section paint endpoints
  @Post('sections/:sectionId/paints')
  @ApiOperation({ summary: 'Add a paint to a section' })
  async addPaintToSection(
    @Param('sectionId') sectionId: string,
    @Body() dto: AddSectionPaintDto
  ) {
    return { data: await this.colorSchemesService.addPaintToSection(sectionId, dto) };
  }

  @Patch('section-paints/:paintId')
  @ApiOperation({ summary: 'Update a section paint' })
  async updateSectionPaint(
    @Param('paintId') paintId: string,
    @Body() dto: UpdateSectionPaintDto
  ) {
    return { data: await this.colorSchemesService.updateSectionPaint(paintId, dto) };
  }

  @Delete('section-paints/:paintId')
  @ApiOperation({ summary: 'Delete a section paint' })
  async removeSectionPaint(@Param('paintId') paintId: string) {
    await this.colorSchemesService.removeSectionPaint(paintId);
    return { message: 'Section paint deleted successfully' };
  }
}
