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
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeDifficulty } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('recipes')
@ApiBearerAuth()
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recipe' })
  create(@CurrentUser('id') userId: string, @Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(userId, createRecipeDto);
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

  @Get('mine')
  @ApiOperation({ summary: 'Get my recipes' })
  getMyRecipes(@CurrentUser('id') userId: string) {
    return this.recipesService.findMyRecipes(userId);
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get saved recipes' })
  getSaved(@CurrentUser('id') userId: string) {
    return this.recipesService.getSavedRecipes(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recipe by ID' })
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recipe' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto
  ) {
    return this.recipesService.update(userId, id, updateRecipeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recipe' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.recipesService.remove(userId, id);
  }

  @Post(':id/save')
  @ApiOperation({ summary: 'Save a recipe' })
  save(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.recipesService.save(id, userId);
  }

  @Delete(':id/save')
  @ApiOperation({ summary: 'Unsave a recipe' })
  unsave(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.recipesService.unsave(id, userId);
  }
}
