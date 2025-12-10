import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PaintsService } from './paints.service';
import { CreatePaintDto } from './dto/create-paint.dto';
import { ToggleOwnedDto, ToggleWishlistDto } from './dto/toggle-paint.dto';
import { PaintBrand, PaintType } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('paints')
@ApiBearerAuth()
@Controller('paints')
export class PaintsController {
  constructor(private readonly paintsService: PaintsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a custom paint' })
  create(@Body() createPaintDto: CreatePaintDto) {
    return this.paintsService.create(createPaintDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all paints' })
  @ApiQuery({ name: 'brand', required: false, enum: PaintBrand })
  @ApiQuery({ name: 'type', required: false, enum: PaintType })
  findAll(
    @Query('brand') brand?: PaintBrand,
    @Query('type') type?: PaintType
  ) {
    return this.paintsService.findAll({ brand, type });
  }

  @Get('collection')
  @ApiOperation({ summary: 'Get user paint collection with owned/wishlist status' })
  getUserCollection(@CurrentUser('id') userId: string) {
    return this.paintsService.getUserCollection(userId);
  }

  @Patch(':id/owned')
  @ApiOperation({ summary: 'Toggle paint owned status' })
  toggleOwned(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ToggleOwnedDto
  ) {
    return this.paintsService.toggleOwned(id, userId, dto.owned);
  }

  @Patch(':id/wishlist')
  @ApiOperation({ summary: 'Toggle paint wishlist status' })
  toggleWishlist(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ToggleWishlistDto
  ) {
    return this.paintsService.toggleWishlist(id, userId, dto.wishlist);
  }
}
