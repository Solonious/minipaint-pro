import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaintsService } from './paints.service';
import { CreatePaintDto } from './dto/create-paint.dto';
import { ToggleOwnedDto, ToggleWishlistDto } from './dto/toggle-paint.dto';
import { PaintBrand, PaintType } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';

// For MVP without auth, use null userId
// This will be replaced with actual user ID from JWT when auth is implemented
const TEMP_USER_ID = null;

@ApiTags('paints')
@Controller('paints')
@Public()
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
  getUserCollection() {
    return this.paintsService.getUserCollection(TEMP_USER_ID);
  }

  @Patch(':id/owned')
  @ApiOperation({ summary: 'Toggle paint owned status' })
  toggleOwned(@Param('id') id: string, @Body() dto: ToggleOwnedDto) {
    return this.paintsService.toggleOwned(id, TEMP_USER_ID, dto.owned);
  }

  @Patch(':id/wishlist')
  @ApiOperation({ summary: 'Toggle paint wishlist status' })
  toggleWishlist(@Param('id') id: string, @Body() dto: ToggleWishlistDto) {
    return this.paintsService.toggleWishlist(id, TEMP_USER_ID, dto.wishlist);
  }
}
