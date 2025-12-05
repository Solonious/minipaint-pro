import { Module } from '@nestjs/common';
import { ArmiesService } from './armies.service';
import { ArmiesController } from './armies.controller';

@Module({
  controllers: [ArmiesController],
  providers: [ArmiesService],
  exports: [ArmiesService],
})
export class ArmiesModule {}
