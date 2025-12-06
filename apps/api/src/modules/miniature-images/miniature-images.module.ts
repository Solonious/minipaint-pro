import { Module } from '@nestjs/common';
import { MiniatureImagesService } from './miniature-images.service';
import { MiniatureImagesController } from './miniature-images.controller';

@Module({
  controllers: [MiniatureImagesController],
  providers: [MiniatureImagesService],
  exports: [MiniatureImagesService],
})
export class MiniatureImagesModule {}
