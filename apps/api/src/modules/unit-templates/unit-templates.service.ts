import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUnitTemplateDto } from './dto/create-unit-template.dto';
import { UpdateUnitTemplateDto } from './dto/update-unit-template.dto';
import { UnitTemplate, GameSystem, Prisma } from '@prisma/client';

@Injectable()
export class UnitTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createUnitTemplateDto: CreateUnitTemplateDto): Promise<UnitTemplate> {
    try {
      return await this.prisma.unitTemplate.create({
        data: {
          ...createUnitTemplateDto,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A unit template with this name, faction, and game system already exists');
        }
      }
      throw error;
    }
  }

  async findAll(userId: string, filters?: {
    gameSystem?: GameSystem;
    faction?: string;
    search?: string;
  }): Promise<UnitTemplate[]> {
    const where: Prisma.UnitTemplateWhereInput = { userId };

    if (filters?.gameSystem) {
      where.gameSystem = filters.gameSystem;
    }

    if (filters?.faction) {
      where.faction = { contains: filters.faction, mode: 'insensitive' };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { faction: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.unitTemplate.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { lastUsedAt: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async search(userId: string, query: string, gameSystem?: GameSystem): Promise<UnitTemplate[]> {
    const where: Prisma.UnitTemplateWhereInput = {
      userId,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { faction: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (gameSystem) {
      where.gameSystem = gameSystem;
    }

    return this.prisma.unitTemplate.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { lastUsedAt: 'desc' },
      ],
      take: 10,
    });
  }

  async findOne(userId: string, id: string): Promise<UnitTemplate> {
    const template = await this.prisma.unitTemplate.findFirst({
      where: { id, userId },
    });

    if (!template) {
      throw new NotFoundException(`Unit template with ID ${id} not found`);
    }

    return template;
  }

  async findOrCreate(userId: string, createDto: CreateUnitTemplateDto): Promise<UnitTemplate> {
    const existing = await this.prisma.unitTemplate.findFirst({
      where: {
        userId,
        name: { equals: createDto.name, mode: 'insensitive' },
        faction: { equals: createDto.faction, mode: 'insensitive' },
        gameSystem: createDto.gameSystem,
      },
    });

    if (existing) {
      return existing;
    }

    return this.create(userId, createDto);
  }

  async update(userId: string, id: string, updateUnitTemplateDto: UpdateUnitTemplateDto): Promise<UnitTemplate> {
    await this.findOne(userId, id);

    try {
      return await this.prisma.unitTemplate.update({
        where: { id },
        data: updateUnitTemplateDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A unit template with this name, faction, and game system already exists');
        }
      }
      throw error;
    }
  }

  async incrementUsage(userId: string, id: string): Promise<UnitTemplate> {
    await this.findOne(userId, id);

    return this.prisma.unitTemplate.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  }

  async remove(userId: string, id: string): Promise<UnitTemplate> {
    await this.findOne(userId, id);

    return this.prisma.unitTemplate.delete({
      where: { id },
    });
  }
}
