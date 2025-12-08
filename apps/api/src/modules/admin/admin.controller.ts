import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminUsersService } from './admin-users.service';
import { UploadImageDto, ImportImageDto } from './dto/upload-image.dto';
import { UserListQueryDto, UpdateUserDto } from './dto/user-management.dto';
import { GameSystem, UserRole } from '@prisma/client';
import { memoryStorage } from 'multer';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('admin')
@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminUsersService: AdminUsersService
  ) {}

  @Post('images/upload')
  @ApiOperation({ summary: 'Upload an image for a unit' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        gameSystem: { type: 'string', enum: Object.values(GameSystem) },
        faction: { type: 'string' },
        unitName: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png|gif|webp)/i }),
        ],
        fileIsRequired: true,
      })
    )
    file: MulterFile,
    @Body() dto: UploadImageDto
  ) {
    return this.adminService.uploadImage(
      file,
      dto.gameSystem,
      dto.faction,
      dto.unitName
    );
  }

  @Post('images/import')
  @ApiOperation({ summary: 'Import an image from a URL' })
  async importImage(@Body() dto: ImportImageDto) {
    return this.adminService.importImage(dto);
  }

  @Get('images')
  @ApiOperation({ summary: 'Get all unit images' })
  @ApiQuery({ name: 'gameSystem', required: false, enum: GameSystem })
  @ApiQuery({ name: 'faction', required: false })
  async getAllImages(
    @Query('gameSystem') gameSystem?: GameSystem,
    @Query('faction') faction?: string
  ) {
    return this.adminService.getAllImages(gameSystem, faction);
  }

  @Get('images/stats')
  @ApiOperation({ summary: 'Get image statistics' })
  async getImageStats() {
    return this.adminService.getImageStats();
  }

  @Get('images/by-unit')
  @ApiOperation({ summary: 'Get image for a specific unit' })
  @ApiQuery({ name: 'gameSystem', required: true, enum: GameSystem })
  @ApiQuery({ name: 'faction', required: true })
  @ApiQuery({ name: 'unitName', required: true })
  async getImageByUnit(
    @Query('gameSystem') gameSystem: GameSystem,
    @Query('faction') faction: string,
    @Query('unitName') unitName: string
  ) {
    return this.adminService.getImageByUnit(gameSystem, faction, unitName);
  }

  @Get('images/:id')
  @ApiOperation({ summary: 'Get image by ID' })
  async getImageById(@Param('id') id: string) {
    return this.adminService.getImageById(id);
  }

  @Delete('images/:id')
  @ApiOperation({ summary: 'Delete an image' })
  async deleteImage(@Param('id') id: string) {
    await this.adminService.deleteImage(id);
    return { success: true };
  }

  // ============================================
  // User Management Endpoints
  // ============================================

  @Get('users')
  @ApiOperation({ summary: 'Get paginated list of users' })
  async getUsers(@Query() query: UserListQueryDto) {
    return this.adminUsersService.findAll(query);
  }

  @Get('users/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  async getUserStats() {
    return { data: await this.adminUsersService.getStats() };
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('id') id: string) {
    return { data: await this.adminUsersService.findOne(id) };
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') currentUserId: string
  ) {
    return { data: await this.adminUsersService.update(id, dto, currentUserId) };
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Deactivate user (soft delete)' })
  async deactivateUser(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string
  ) {
    return { data: await this.adminUsersService.deactivate(id, currentUserId) };
  }

  @Post('users/:id/force-password-reset')
  @ApiOperation({ summary: 'Force password reset for user' })
  async forcePasswordReset(@Param('id') id: string) {
    return this.adminUsersService.forcePasswordReset(id);
  }
}
