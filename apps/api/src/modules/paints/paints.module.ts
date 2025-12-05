import { Module } from '@nestjs/common';
import { PaintsService } from './paints.service';
import { PaintsController } from './paints.controller';

@Module({
  controllers: [PaintsController],
  providers: [PaintsService],
  exports: [PaintsService],
})
export class PaintsModule {}
