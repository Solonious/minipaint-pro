import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { MiniatureImagesService } from './miniature-images.service';
import {
  CreateMiniatureImageDto,
  UpdateMiniatureImageDto,
  ReorderImagesDto,
} from './dto/create-miniature-image.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('Miniature Images')
@ApiBearerAuth()
@Controller('miniature-images')
export class MiniatureImagesController {
  constructor(private readonly miniatureImagesService: MiniatureImagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an image record using external URL' })
  async createByUrl(@CurrentUser('id') userId: string, @Body() dto: CreateMiniatureImageDto) {
    return { data: await this.miniatureImagesService.createByUrl(userId, dto) };
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload an image for a miniature' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        miniatureId: { type: 'string' },
        caption: { type: 'string' },
        imageType: { type: 'string', enum: ['REFERENCE', 'WIP', 'COMPLETED', 'DETAIL'] },
        order: { type: 'number' },
      },
      required: ['file', 'miniatureId'],
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadImage(
    @CurrentUser('id') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png|gif|webp)/i }),
        ],
        fileIsRequired: true,
      })
    )
    file: MulterFile,
    @Body() dto: CreateMiniatureImageDto
  ) {
    return { data: await this.miniatureImagesService.uploadImage(userId, file, dto) };
  }

  @Get('miniature/:miniatureId')
  @ApiOperation({ summary: 'Get all images for a miniature' })
  async findByMiniature(
    @CurrentUser('id') userId: string,
    @Param('miniatureId') miniatureId: string
  ) {
    return { data: await this.miniatureImagesService.findByMiniature(userId, miniatureId) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an image by ID' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return { data: await this.miniatureImagesService.findOne(userId, id) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update image metadata' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMiniatureImageDto
  ) {
    return { data: await this.miniatureImagesService.update(userId, id, dto) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an image' })
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.miniatureImagesService.remove(userId, id);
    return { message: 'Image deleted successfully' };
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder images for a miniature' })
  async reorder(@CurrentUser('id') userId: string, @Body() dto: ReorderImagesDto) {
    return { data: await this.miniatureImagesService.reorder(userId, dto.miniatureId, dto.imageIds) };
  }

  @Public()
  @Get('file/:filename')
  @ApiOperation({ summary: 'Serve an image file' })
  async serveImage(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = this.miniatureImagesService.getImageFilePath(filename);
    return res.sendFile(filepath);
  }

  @Public()
  @Get('proxy')
  @ApiOperation({ summary: 'Proxy external image to avoid CORS issues' })
  @ApiQuery({ name: 'url', required: true, description: 'External image URL to proxy' })
  async proxyImage(@Query('url') url: string, @Res() res: Response) {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    try {
      // Use a more browser-like User-Agent to avoid being blocked
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          Referer: new URL(url).origin,
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new BadRequestException(`Failed to fetch image: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const buffer = Buffer.from(await response.arrayBuffer());

      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      });

      return res.send(buffer);
    } catch (error) {
      throw new BadRequestException(`Failed to proxy image: ${error}`);
    }
  }
}
