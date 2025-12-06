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
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeDifficulty } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';

// For MVP without auth, use null userId
const TEMP_USER_ID = null;

@ApiTags('recipes')
@Controller('recipes')
@Public()
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recipe' })
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recipes' })
  @ApiQuery({ name: 'difficulty', required: false, enum: RecipeDifficulty })
  @ApiQuery({ name: 'tag', required: false })
  findAll(
    @Query('difficulty') difficulty?: RecipeDifficulty,
    @Query('tag') tag?: string
  ) {
    return this.recipesService.findAll({ difficulty, tag });
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get saved recipes' })
  getSaved() {
    return this.recipesService.getSavedRecipes(TEMP_USER_ID);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recipe by ID' })
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recipe' })
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recipe' })
  remove(@Param('id') id: string) {
    return this.recipesService.remove(id);
  }

  @Post(':id/save')
  @ApiOperation({ summary: 'Save a recipe' })
  save(@Param('id') id: string) {
    return this.recipesService.save(id, TEMP_USER_ID);
  }

  @Delete(':id/save')
  @ApiOperation({ summary: 'Unsave a recipe' })
  unsave(@Param('id') id: string) {
    return this.recipesService.unsave(id, TEMP_USER_ID);
  }
}
