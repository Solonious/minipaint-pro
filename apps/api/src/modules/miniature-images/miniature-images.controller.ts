import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { MiniatureImagesService } from './miniature-images.service';
import {
  CreateMiniatureImageDto,
  UpdateMiniatureImageDto,
  ReorderImagesDto,
} from './dto/create-miniature-image.dto';
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
@Controller('miniature-images')
@Public()
export class MiniatureImagesController {
  constructor(private readonly miniatureImagesService: MiniatureImagesService) {}

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
    return { data: await this.miniatureImagesService.uploadImage(file, dto) };
  }

  @Get('miniature/:miniatureId')
  @ApiOperation({ summary: 'Get all images for a miniature' })
  async findByMiniature(@Param('miniatureId') miniatureId: string) {
    return { data: await this.miniatureImagesService.findByMiniature(miniatureId) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an image by ID' })
  async findOne(@Param('id') id: string) {
    return { data: await this.miniatureImagesService.findOne(id) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update image metadata' })
  async update(@Param('id') id: string, @Body() dto: UpdateMiniatureImageDto) {
    return { data: await this.miniatureImagesService.update(id, dto) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an image' })
  async remove(@Param('id') id: string) {
    await this.miniatureImagesService.remove(id);
    return { message: 'Image deleted successfully' };
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder images for a miniature' })
  async reorder(@Body() dto: ReorderImagesDto) {
    return { data: await this.miniatureImagesService.reorder(dto.miniatureId, dto.imageIds) };
  }

  @Get('file/:filename')
  @ApiOperation({ summary: 'Serve an image file' })
  async serveImage(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = this.miniatureImagesService.getImageFilePath(filename);
    return res.sendFile(filepath);
  }
}
