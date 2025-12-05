import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaintDto } from './dto/create-paint.dto';
import { Paint, PaintBrand, PaintType } from '@prisma/client';

@Injectable()
export class PaintsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaintDto: CreatePaintDto): Promise<Paint> {
    return this.prisma.paint.create({
      data: createPaintDto,
    });
  }

  async findAll(filters?: {
    brand?: PaintBrand;
    type?: PaintType;
  }): Promise<Paint[]> {
    return this.prisma.paint.findMany({
      where: {
        ...(filters?.brand && { brand: filters.brand }),
        ...(filters?.type && { type: filters.type }),
      },
      orderBy: [
        { brand: 'asc' },
        { type: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: string): Promise<Paint> {
    const paint = await this.prisma.paint.findUnique({
      where: { id },
    });

    if (!paint) {
      throw new NotFoundException(`Paint with ID ${id} not found`);
    }

    return paint;
  }

  async getUserCollection(userId: string): Promise<Array<Paint & { owned: boolean; wishlist: boolean }>> {
    const paints = await this.prisma.paint.findMany({
      include: {
        userPaints: {
          where: { userId },
        },
      },
      orderBy: [
        { brand: 'asc' },
        { type: 'asc' },
        { name: 'asc' },
      ],
    });

    return paints.map((paint) => {
      const userPaint = paint.userPaints[0];
      const { userPaints, ...paintData } = paint;
      return {
        ...paintData,
        owned: userPaint?.owned ?? false,
        wishlist: userPaint?.wishlist ?? false,
      };
    });
  }

  async toggleOwned(paintId: string, userId: string, owned: boolean): Promise<{ owned: boolean }> {
    await this.findOne(paintId);

    await this.prisma.userPaint.upsert({
      where: {
        userId_paintId: { userId, paintId },
      },
      update: { owned },
      create: { userId, paintId, owned },
    });

    return { owned };
  }

  async toggleWishlist(paintId: string, userId: string, wishlist: boolean): Promise<{ wishlist: boolean }> {
    await this.findOne(paintId);

    await this.prisma.userPaint.upsert({
      where: {
        userId_paintId: { userId, paintId },
      },
      update: { wishlist },
      create: { userId, paintId, wishlist },
    });

    return { wishlist };
  }
}
