import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Recipe, RecipeDifficulty } from '@prisma/client';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    const { steps, ...recipeData } = createRecipeDto;

    return this.prisma.recipe.create({
      data: {
        ...recipeData,
        steps: {
          create: steps,
        },
      },
      include: {
        steps: {
          include: { paint: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findAll(filters?: {
    difficulty?: RecipeDifficulty;
    tag?: string;
  }): Promise<Recipe[]> {
    return this.prisma.recipe.findMany({
      where: {
        ...(filters?.difficulty && { difficulty: filters.difficulty }),
        ...(filters?.tag && { tags: { has: filters.tag } }),
      },
      include: {
        steps: {
          include: { paint: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: {
        rating: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Recipe> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        steps: {
          include: { paint: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    return recipe;
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<Recipe> {
    await this.findOne(id);

    const { steps, ...recipeData } = updateRecipeDto;

    if (steps) {
      await this.prisma.recipeStep.deleteMany({
        where: { recipeId: id },
      });
    }

    return this.prisma.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        ...(steps && {
          steps: {
            create: steps,
          },
        }),
      },
      include: {
        steps: {
          include: { paint: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async remove(id: string): Promise<Recipe> {
    await this.findOne(id);

    return this.prisma.recipe.delete({
      where: { id },
    });
  }

  async save(recipeId: string, userId: string | null): Promise<{ saved: boolean }> {
    await this.findOne(recipeId);

    const existing = await this.prisma.savedRecipe.findFirst({
      where: { userId, recipeId },
    });

    if (!existing) {
      await this.prisma.savedRecipe.create({
        data: { userId, recipeId },
      });
    }

    return { saved: true };
  }

  async unsave(recipeId: string, userId: string | null): Promise<{ saved: boolean }> {
    await this.prisma.savedRecipe.deleteMany({
      where: { userId, recipeId },
    });

    return { saved: false };
  }

  async getSavedRecipes(userId: string | null): Promise<Recipe[]> {
    const saved = await this.prisma.savedRecipe.findMany({
      where: { userId },
      include: {
        recipe: {
          include: {
            steps: {
              include: { paint: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return saved.map((s) => s.recipe);
  }
}
