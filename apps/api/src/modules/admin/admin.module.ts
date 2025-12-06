import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UploadsController, UnitImagesController } from './uploads.controller';

@Module({
  controllers: [AdminController, UploadsController, UnitImagesController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
