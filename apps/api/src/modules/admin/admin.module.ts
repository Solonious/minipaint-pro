import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminUsersService } from './admin-users.service';
import { AdminController } from './admin.controller';
import { UploadsController, UnitImagesController } from './uploads.controller';

@Module({
  controllers: [AdminController, UploadsController, UnitImagesController],
  providers: [AdminService, AdminUsersService],
  exports: [AdminService, AdminUsersService],
})
export class AdminModule {}
