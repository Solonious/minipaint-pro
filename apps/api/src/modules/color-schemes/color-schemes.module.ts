import { Module } from '@nestjs/common';
import { ColorSchemesService } from './color-schemes.service';
import { ColorSchemesController } from './color-schemes.controller';

@Module({
  controllers: [ColorSchemesController],
  providers: [ColorSchemesService],
  exports: [ColorSchemesService],
})
export class ColorSchemesModule {}
