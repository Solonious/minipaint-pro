import { Module } from '@nestjs/common';
import { MiniaturesService } from './miniatures.service';
import { MiniaturesController } from './miniatures.controller';

@Module({
  controllers: [MiniaturesController],
  providers: [MiniaturesService],
  exports: [MiniaturesService],
})
export class MiniaturesModule {}
